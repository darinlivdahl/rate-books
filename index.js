import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";
import env from "dotenv";

const app = express();
const port = 3000;
const saltRounds = 10;
env.config();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

/* https://github.com/brianc/node-postgres/issues/957#issuecomment-426852393 */
// expand(3, 2) returns "($1, $2), ($3, $4), ($5, $6)" 
function expand(rowCount, columnCount, startAt = 1) {
    var index = startAt;
    return Array(rowCount)
        .fill(0)
        .map(
        (v) =>
            `(${Array(columnCount)
            .fill(0)
            .map((v) => `$${index++}`)
            .join(", ")})`
        )
        .join(", ");
}
  
// flatten([[1, 2], [3, 4]]) returns [1, 2, 3, 4]
function flatten(arr) {
    var newArr = [];
    arr.forEach((v) => v.forEach((p) => newArr.push(p)));
    return newArr;
}

async function getUserId(userName) {
    let userId;
    const userResult = await db.query("SELECT id FROM users WHERE email = $1", [userName]);
    if (userResult.rows.length !== 0) {
        userId = userResult.rows[0].id;
    } else {
        console.error('Could not get user Id.');
    }
    return userId;
}

async function getCategories(userName) {
    let userId = null;
    let categories = [];
    // Get user id based on logged in user email address
    try {
        userId = await getUserId(userName);
        if (userId) {
            // Get list of categories for logged in user
            const categoriesResult = await db.query("SELECT id, title FROM category WHERE user_id = $1 ORDER BY title ASC", [userId]);
            if (categoriesResult.rows.length > 0) {
                categories = categoriesResult.rows;
            }
        }
    } catch (err) {
        console.error(err);
    }
    return categories;
}

async function getQuizzes(userName) {
    let userId = null;
    let quizzes = [];
    // Get user id based on logged in user email address
    try {
        userId = await getUserId(userName);
        if (userId) {
            // Get list of categories for logged in user
            const quizzesResult = await db.query("SELECT id, title FROM quiz WHERE user_id = $1 ORDER BY title ASC", [userId]);
            if (quizzesResult.rows.length > 0) {
                quizzes = quizzesResult.rows;
            }
        }
    } catch (err) {
        console.error(err);
    }
    return quizzes;
}

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/studynotes",
  passport.authenticate("google", {
    successRedirect: "/notes",
    failureRedirect: "/login",
  })
);

app.get("/", async (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect("/notes");
    } else {
        res.redirect("/login");
    }
});

app.get("/login", (req, res) => {
    res.render("login.ejs", {
        activeNav: "login",
        loggedIn: false
    });
});

// Get route for local login
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/notes",
    failureRedirect: "/login",
  })
);

app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

app.get("/register", (req, res) => {
    res.render("register.ejs", {
        activeNav: "register",
        loggedIn: false
    });
});

app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      req.redirect("/login");
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          const result = await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
            [email, hash]
          );
          const user = result.rows[0];
          req.login(user, (err) => {
            res.redirect("/notes");
          });
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
});

app.get("/notes", async (req, res) => {
    if (req.isAuthenticated()) {
        const userName = req.user.email;
        let notesData = [];
        // First, get user id from table based on logged in email address username
        try {
            const userId = await getUserId(userName);
            if (userId) {
                // If user found, get notes from database
                try {
                    const result = await db.query("SELECT id,title,description,reference_url,created_date FROM note WHERE user_id = $1 ORDER BY id DESC",[userId]);
                    if (result.rows.length > 0) {
                        notesData = result.rows;
                    }
                    res.render("notes.ejs", {
                        activeNav: "home",
                        notes: notesData,
                        loggedIn: true,
                        user: userName
                    });
                } catch (err) {
                    console.error(err);
                }
            } else {
                console.log("No user found.");
            }
        } catch (err) {
            console.error(err);
        }
    } else {
        res.redirect("/login");
    }
});

/* Note routes */

app.get("/add-note", async (req, res) => {
    if (req.isAuthenticated()) {
        const userName = req.user.email;
        const data = await getCategories(userName);
        res.render("add-note.ejs", {
            activeNav: "home",
            categories: data,
            loggedIn: true,
            user: userName
        });
    } else {
        res.redirect("/login");
    }
});

app.post("/submit-note", async (req, res) => {
    const userName = req.user.email;
    const title = req.body.title.trim();
    const description = req.body.description;
    const quizKeyword = req.body.quizKeyword.trim();
    const referenceUrl = req.body.referenceUrl.trim();
    const date = new Date();
    const formattedDate = date.toISOString().slice(0, 10);
    const selectedCategories = (typeof req.body.categories === 'string') ? [req.body.categories] : req.body.categories;
    try {
        const userId = await getUserId(userName);
        if (userId) {
            try {
                const result = await db.query("INSERT INTO note (title, description, quiz_keyword, reference_url, created_date, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
                    [title, description, quizKeyword, referenceUrl, formattedDate, userId]
                );
                const newRecordId = result.rows[0].id;
                let categoryItemsToAddArr = [];
                if (selectedCategories.length) {
                    selectedCategories.forEach(c => {
                        categoryItemsToAddArr.push([parseInt(c), parseInt(newRecordId), parseInt(userId)]);
                    });
                }
                // Create category item records based on selected
                await db.query(`INSERT INTO category_item (category_id, note_id, user_id) VALUES ${expand(categoryItemsToAddArr.length, 3)}`, flatten(categoryItemsToAddArr));
                res.redirect("/notes");
            } catch(err) {
                console.error(err);
            }
        } else {
            console.log('User not found.');
        }
    } catch (err) {
        console.error(err);
    }
});

app.get("/edit-note/:id", async (req, res) => {
    if (req.isAuthenticated()) {
        const userName = req.user.email;
        const noteId = req.params.id;
        const allCategoryData = await getCategories(userName);
        let noteData = [];
        let selectedCategoryData = [];
        try {
            const userId = await getUserId(userName);
            const noteResult = await db.query("SELECT id, title, description, quiz_keyword, reference_url FROM note WHERE id = $1 AND user_id = $2", [noteId, userId]);
            if (noteResult.rows.length != 0) {
                noteData = noteResult.rows[0];
            }
            // Get all categories and selected category data
            const categoriesResult = await db.query("SELECT category_id, note_id FROM category_item WHERE note_id = $1 AND user_id = $2", [noteId, userId]);
            if (categoriesResult.rows.length > 0) {
                selectedCategoryData = categoriesResult.rows;
            }
            res.render("edit-note.ejs", {
                activeNav: "home",
                note: noteData,
                allCategories: allCategoryData,
                selectedCategories: selectedCategoryData,
                loggedIn: true,
                user: userName
            });
        } catch(err) {
            console.error(err);
        }
    } else {
        res.redirect("/login");
    }
});

app.post("/save-note", async (req, res) => {
    const noteId = parseInt(req.body.noteId);
    const title = req.body.title.trim();
    const description = req.body.description;
    const quizKeyword = req.body.quizKeyword.trim();
    const referenceUrl = req.body.referenceUrl.trim();
    const date = new Date();
    const formattedDate = date.toISOString().slice(0, 10);
    const selectedCategories = (typeof req.body.categories === 'string') ? [req.body.categories] : req.body.categories;
    try {
        const userId = await getUserId(req.user.email);
        await db.query("UPDATE note SET title = $1, description = $2, quiz_keyword = $3, reference_url = $4, modified_date = $5 WHERE id = $6 AND user_id = $7", [title, description, quizKeyword, referenceUrl, formattedDate, noteId, userId]);
        // ON EDIT the note is always going to have at least one existing category item
            // and at least one selected category to save
            // because the category field is required on the front-end
        const pruneResults = await db.query("SELECT category_id FROM category_item WHERE note_id = $1 AND user_id = $2", [noteId, userId]);
        const pruneData = pruneResults.rows;
        const deleteSet = [];
        let categoryItemsToAddArr = [];
            
        // If Some category item records already exist for this note, check with newly selected
        if (pruneData.length) {
            pruneData.forEach(pd => {
                const pdCatId = parseInt(pd.category_id);
                const found = selectedCategories.find((c) => parseInt(c) === pdCatId);
                if (found === undefined) {
                    // Add this item to a collection to delete next, because
                        // it is no longer selected for the note
                    deleteSet.push(pdCatId);
                }
            });
        } else {
            console.log('No selected categories conflict with existing category item data for this note.');
        }
        if (deleteSet.length) {
            await db.query("DELETE FROM category_item WHERE category_id = ANY($1) AND note_id = $2 AND user_id = $3",[deleteSet, noteId, userId]);
        }
        // Now create the collection of category IDs that need to be associated with this note
            // minus the ones that already exist
        if (selectedCategories.length) {
            selectedCategories.forEach(c => {
                const catId = parseInt(c);
                const found = pruneData.find((pd) => parseInt(pd.category_id) === catId);
                if (found === undefined) {
                    categoryItemsToAddArr.push([catId, noteId, userId]);
                }
            });
            // Create new category item records based on selected
            if (categoryItemsToAddArr.length) {
                await db.query(`INSERT INTO category_item (category_id, note_id, user_id) VALUES ${expand(categoryItemsToAddArr.length, 3)}`, flatten(categoryItemsToAddArr));
            }
            res.redirect("/notes");
        } else {
            console.error('There should be a selected category for this note.');
        }
    } catch(err) {
        console.error(err);
    }
});

app.post("/delete-note", async (req, res) => {
    const userName = req.user.email;
    const noteId = req.body.noteId;   
    try {
        const userId = await getUserId(userName);
        // Delete category items with note_id
        await db.query("DELETE FROM category_item WHERE note_id = $1 AND user_id = $2", [noteId, userId]);
        // Delete quiz items with note_id
        await db.query("DELETE FROM quiz_item WHERE note_id = $1 AND user_id = $2", [noteId, userId]);
        // Delete note after related records are deleted
        await db.query("DELETE FROM note WHERE id = $1 AND user_id = $2", [noteId, userId]);
        res.redirect("/notes");
    } catch(err) {
        // console.error(err);
        res.render("notes.ejs", {
            activeNav: "home",
            loggedIn: true,
            user: userName,
            error: err
        });
    }
});

/* Category routes */

app.get("/categories", async (req, res) => {
    if (req.isAuthenticated()) {
        const userName = req.user.email;
        const data = await getCategories(userName);
        res.render("categories.ejs", {
            activeNav: "categories",
            categories: data,
            loggedIn: true,
            user: userName
        });
    } else {
        res.redirect("/login");
    }
});

app.get("/add-category", async (req, res) => {
    if (req.isAuthenticated()) {
        const userName = req.user.email;
        res.render("add-category.ejs", {
            activeNav: "categories",
            loggedIn: true,
            user: userName
        });
    } else {
        res.redirect("/login");
    }
});

app.post("/submit-category", async (req, res) => {
    const userName = req.user.email;
    const categoryTitle = req.body.title.trim();
    try {
        const userId = await getUserId(userName);
        await db.query("INSERT INTO category (title, user_id) VALUES ($1, $2)",[categoryTitle, userId]);
        res.redirect('/categories')
    } catch(err) {
        res.render('add-category.ejs', { activeNav: "categories", error: err.detail })
    }
});

app.get("/edit-category/:id", async (req, res) => {
    if (req.isAuthenticated()) {
        const userName = req.user.email;
        let data = [];
        try {
            const userId = await getUserId(userName);
            const result = await db.query("SELECT id, title FROM category WHERE id = $1 AND user_id = $2", [req.params.id, userId]);
            if (result.rows.length != 0) {
                data = result.rows[0];
            }
        } catch(err) {
            console.error(err);
        }
        res.render("edit-category.ejs", {
            activeNav: "categories",
            category: data,
            loggedIn: true,
            user: userName
        });
    } else {
        res.redirect("/login");
    }
});

app.post("/save-category", async (req, res) => {
    const userName = req.user.email;
    const categoryId = req.body.categoryId;
    const categoryTitle = req.body.title.trim();
    try {
        const userId = await getUserId(userName);
        await db.query("UPDATE category SET title = $1 WHERE id = $2 AND user_id = $3",[categoryTitle, categoryId, userId]);
        res.redirect("/categories");
    } catch(err) {
        console.error(err);
    }
});

app.post("/delete-category", async (req, res) => {
    const userName = req.user.email;
    const catId = parseInt(req.body.categoryId);
    try {
        const userId = await getUserId(userName);
        // Delete category items records before deleting category
        await db.query("DELETE FROM category_item WHERE category_id = $1 AND user_id = $2", [catId, userId]);
        // Delete category record after all related records are deleted
        await db.query("DELETE FROM category WHERE id = $1 AND user_id = $2", [catId, userId]);
        res.redirect("/categories");
    } catch(err) {
        console.error(err);
    }
});

app.get("/category/:id", async (req,res) => {
    if (req.isAuthenticated()) {
        const userName = req.user.email;
        const catId = parseInt(req.params.id);
        let data = [];
        let categoryTitle = '';

        // Get category details
        try {
            const userId = await getUserId(userName);
            const categoryResult = await db.query("SELECT title FROM category WHERE id = $1 AND user_id = $2", [catId, userId]);
            if (categoryResult.rows.length !== 0) {
                categoryTitle = categoryResult.rows[0].title;
            }
            const noteResult = await db.query("SELECT note.title, note.reference_url, note.created_date, note.description, category_item.note_id FROM category_item JOIN note ON note.id = category_item.note_id WHERE category_item.category_id = $1 AND category_item.user_id = $2 ORDER BY note.id DESC", [catId, userId]);
            if (noteResult.rows.length > 0) {
                data = noteResult.rows;
            }
            res.render("category.ejs", {
                activeNav: "categories",
                title: categoryTitle,
                notes: data,
                loggedIn: true,
                user: userName
            });
        } catch(err) {
            console.error(err);
        }
    } else {
        res.redirect("/login");
    }
});

/* Quiz routes */

app.get("/quizzes", async (req, res) => {
    if (req.isAuthenticated()) {
        const userName = req.user.email;
        const data = await getQuizzes(userName);
        res.render("quizzes.ejs", {
            activeNav: "quizzes",
            quizzes: data,
            loggedIn: true,
            user: userName
        });
    } else {
        res.redirect("/login");
    }
});

app.get("/add-quiz", async (req, res) => {
    if (req.isAuthenticated()) {
        const userName = req.user.email;
        // Get list of all notes for quiz selection
        let notesData = [];
        // First, get user id from table based on logged in email address username
        try {
            const userId = await getUserId(userName);
            if (userId) {
                // If user found, get notes from database
                try {
                    const result = await db.query("SELECT id,title FROM note WHERE user_id = $1 ORDER BY title ASC",[userId]);
                    if (result.rows.length > 0) {
                        notesData = result.rows;
                    }
                    res.render("add-quiz.ejs", {
                        activeNav: "quizzes",
                        notes: notesData,
                        loggedIn: true,
                        user: userName
                    });
                } catch (err) {
                    console.error(err);
                }
            } else {
                console.log("No user found.");
            }
        } catch (err) {
            console.error(err);
        }
    } else {
        res.redirect("/login");
    }
});

app.post("/submit-quiz", async (req, res) => {
    const userName = req.user.email;
    const quizTitle = req.body.title.trim();
    const quizNotes = (typeof req.body.quizNote === "object") ? req.body.quizNote : [req.body.quizNote];
    // Insert new quiz before inserting selected note items
    try {
        const userId = await getUserId(userName);
        const result = await db.query("INSERT INTO quiz (title, user_id) VALUES ($1, $2) RETURNING id",[quizTitle, userId]);
        const newRecordId = result.rows[0].id;
        let noteItemsToAddToQuizArr = [];
        if (quizNotes.length) {
            quizNotes.forEach(n => {
                noteItemsToAddToQuizArr.push([parseInt(n), parseInt(newRecordId), parseInt(userId)]);
            });
        }
        // Create quiz item records based on selected notes for newly created quiz
        if (noteItemsToAddToQuizArr.length) {
            await db.query(`INSERT INTO quiz_item (note_id, quiz_id, user_id) VALUES ${expand(noteItemsToAddToQuizArr.length, 3)}`, flatten(noteItemsToAddToQuizArr));
        }
        res.redirect('/quizzes');
    } catch(err) {
        res.render('add-quiz.ejs', { activeNav: "quizzes", error: err.detail })
    }
});

app.get("/edit-quiz/:id", async (req, res) => {
    if (req.isAuthenticated()) {
        const userName = req.user.email;
        let data = [];
        // Get quiz details
        try {
            const userId = await getUserId(userName);
            const result = await db.query("SELECT id, title FROM quiz WHERE id = $1 AND user_id = $2", [req.params.id, userId]);
            if (result.rows.length != 0) {
                data = result.rows[0];
                // Get list of all notes for quiz selection
                let notesData = [];
                try {
                    const notesResult = await db.query("SELECT id,title FROM note WHERE user_id = $1 ORDER BY title ASC",[userId]);
                    if (notesResult.rows.length > 0) {
                        notesData = notesResult.rows;
                        // Get selected notes for quiz
                        const selectedNotesResult = await db.query("SELECT note_id FROM quiz_item WHERE quiz_id = $1 AND user_id = $2",[req.params.id, userId]);
                        let selectedNotesIds = [];
                        if (selectedNotesResult.rows.length > 0) {
                            selectedNotesResult.rows.forEach(n => {
                                selectedNotesIds.push(n.note_id);
                            });
                        }
                        res.render("edit-quiz.ejs", {
                            activeNav: "quizzes",
                            quiz: data,
                            notes: notesData,
                            selectedNotes: selectedNotesIds,
                            loggedIn: true,
                            user: userName
                        });
                    }
                } catch (err) {
                    res.render("edit-quiz.ejs", {
                        activeNav: "quizzes",
                        error: err,
                        loggedIn: true,
                        user: userName
                    });
                }
            } else {
                console.log("No quiz found.");
            }
        } catch(err) {
            console.error(err);
        }
    } else {
        res.redirect("/login");
    }
});

app.post("/save-quiz", async (req, res) => {
    const userName = req.user.email;
    const quizId = req.body.quizId;
    const quizTitle = req.body.title.trim();
    const quizNotes = (typeof req.body.quizNote === "object") ? req.body.quizNote : [req.body.quizNote];

    // Update quiz details
    try {
        const userId = await getUserId(userName);
        await db.query("UPDATE quiz SET title = $1 WHERE id = $2 AND user_id = $3",[quizTitle, quizId, userId]);
        
        // Prune quiz items no longer selected
        const pruneResults = await db.query("SELECT note_id FROM quiz_item WHERE quiz_id = $1 AND user_id = $2", [quizId, userId]);
        const pruneData = pruneResults.rows;
        const deleteSet = [];
        let noteItemsToAddArr = [];
            
        // If Some note item records already exist for this quiz, check with newly selected
        if (pruneData.length) {
            pruneData.forEach(pd => {
                const pdNoteId = parseInt(pd.note_id);
                const found = quizNotes.find((n) => parseInt(n) === pdNoteId);
                if (found === undefined) {
                    // Add this item to a collection to delete next, because
                        // it is no longer selected for the quiz
                    deleteSet.push(pdNoteId);
                }
            });
        } else {
            console.log('No selected notes conflict with existing note item data for this quiz.');
        }
        if (deleteSet.length) {
            await db.query("DELETE FROM quiz_item WHERE note_id = ANY($1) AND quiz_id = $2 AND user_id = $3",[deleteSet, quizId, userId]);
        }
        // Now create the collection of note IDs that need to be associated with this quiz
            // minus the ones that already exist
        quizNotes.forEach(n => {
            const noteId = parseInt(n);
            const found = pruneData.find((pd) => parseInt(pd.note_id) === noteId);
            if (found === undefined) {
                noteItemsToAddArr.push([noteId, quizId, userId]);
            }
        });
        // Create new quiz item records based on selected
        if (noteItemsToAddArr.length) {
            await db.query(`INSERT INTO quiz_item (note_id, quiz_id, user_id) VALUES ${expand(noteItemsToAddArr.length, 3)}`, flatten(noteItemsToAddArr));
        }
        res.redirect("/quizzes");
    } catch(err) {
        console.error(err);
    }
});

app.post("/delete-quiz", async (req, res) => {
    const userName = req.user.email;
    const quizId = parseInt(req.body.quizId);
    try {
        const userId = await getUserId(userName);
        // Delete quiz items records before deleting quiz
        await db.query("DELETE FROM quiz_item WHERE quiz_id = $1 AND user_id = $2", [quizId, userId]);
        // Delete quiz record after all related records are deleted
        await db.query("DELETE FROM quiz WHERE id = $1 AND user_id = $2", [quizId, userId]);
        res.redirect("/quizzes");
    } catch(err) {
        console.error(err);
    }
});

/* Search routes */

app.post("/search", async (req, res) => {
    const searchKeyword = req.body.searchKeyword.trim().toLowerCase();
    if (req.isAuthenticated()) {
        const userName = req.user.email;
        let notesData = [];
        // First, get user id from table based on logged in email address username
        try {
            const userId = await getUserId(userName);
            if (userId) {
                // If user found, get notes from database
                try {
                    const result = await db.query("SELECT id,title,description,reference_url,created_date FROM note WHERE user_id = $1 AND LOWER(title) LIKE '%' || $2 || '%'",[userId, searchKeyword]);
                    if (result.rows.length > 0) {
                        notesData = result.rows;
                    }
                    res.render("search.ejs", { //? or notes.ejs
                        notes: notesData,
                        loggedIn: true,
                        user: userName
                    });
                } catch (err) {
                    console.error(err);
                }
            } else {
                console.log("No user found.");
            }
        } catch (err) {
            console.error(err);
        }
    } else {
        res.redirect("/login");
    }
});

passport.use(
  "local",
  new Strategy(async function verify(username, password, cb) {
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1 ", [
        username,
      ]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;
        bcrypt.compare(password, storedHashedPassword, (err, valid) => {
          if (err) {
            console.error("Error comparing passwords:", err);
            return cb(err);
          } else {
            if (valid) {
              return cb(null, user);
            } else {
              return cb(null, false);
            }
          }
        });
      } else {
        return cb("User not found");
      }
    } catch (err) {
      console.log(err);
    }
  })
);

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/studynotes",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        const result = await db.query("SELECT * FROM users WHERE email = $1", [
          profile.email,
        ]);
        if (result.rows.length === 0) {
          const newUser = await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2)",
            [profile.email, "google"]
          );
          return cb(null, newUser.rows[0]);
        } else {
          return cb(null, result.rows[0]);
        }
      } catch (err) {
        return cb(err);
      }
    }
  )
);

passport.serializeUser((user, cb) => {
    cb(null, user);
});

passport.deserializeUser((user, cb) => {
    cb(null, user);
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
