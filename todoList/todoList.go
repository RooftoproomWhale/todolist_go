package todoList

import (
	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"github.com/unrolled/render"
	"github.com/urfave/negroni"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"todolist_go/model"
)

var store = sessions.NewCookieStore([]byte(os.Getenv("SESSION_KEY")))
var rd = render.New()

type AppHandler struct {
	http.Handler
	db model.DBHandler
}

func getSessionID(r *http.Request) string {
	session, err := store.Get(r, "session")
	if err != nil {
		log.Println(err.Error())
		return ""
	}

	val := session.Values["id"]
	if val == nil {
		return ""
	}
	return val.(string)
}

func (a *AppHandler) indexHandler(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, "/index.html", http.StatusTemporaryRedirect)
}

func (a *AppHandler) getTodoListHandler(w http.ResponseWriter, r *http.Request) {

	list := a.db.GetTodos()
	rd.JSON(w, http.StatusOK, list)
}

func (a *AppHandler) addTodoHandler(w http.ResponseWriter, r *http.Request) {
	name := r.FormValue("name")
	todo := a.db.AddTodo(name)
	rd.JSON(w, http.StatusCreated, todo)
}

type Success struct {
	Success bool `json:"success"`
}

func (a *AppHandler) removeTodoHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])
	ok := a.db.RemoveTodo(id)
	if ok {
		rd.JSON(w, http.StatusOK, Success{Success: true})
	} else {
		rd.JSON(w, http.StatusOK, Success{Success: false})
	}
}

func (a *AppHandler) completeTodoHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])
	complete := r.FormValue("complete") == "true"
	ok := a.db.CompleteTodo(id, complete)
	if ok {
		rd.JSON(w, http.StatusOK, Success{Success: true})
	} else {
		rd.JSON(w, http.StatusOK, Success{Success: false})
	}
}

func (a *AppHandler) Close() {
	a.db.Close()
}

func CheckSignin(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	if strings.Contains(r.URL.Path, "/signin.html") || strings.Contains(r.URL.Path, "/auth") {
		next(rw, r)
		return
	}

	sessionID := getSessionID(r)
	if sessionID != "" {
		next(rw, r)
		return
	}

	http.Redirect(rw, r, "/signin.html", http.StatusTemporaryRedirect)
}

func MakeNewHandler(filepath string) *AppHandler {

	mux := mux.NewRouter()
	ng := negroni.New(negroni.NewRecovery(), negroni.NewLogger(), negroni.HandlerFunc(CheckSignin), negroni.NewStatic(http.Dir("public")))
	ng.UseHandler(mux)

	a := &AppHandler{
		Handler: ng, // mux->ng
		db:      model.NewDBHandler(filepath),
	}
	mux.HandleFunc("/", a.indexHandler)
	mux.HandleFunc("/todos", a.getTodoListHandler).Methods("GET")
	mux.HandleFunc("/todos", a.addTodoHandler).Methods("POST")
	mux.HandleFunc("/todos/{id:[0-9]+}", a.removeTodoHandler).Methods("DELETE")
	mux.HandleFunc("/complete-todo/{id:[0-9]+}", a.completeTodoHandler).Methods("GET")
	mux.HandleFunc("/auth/google/login", googleLoginHandler)
	mux.HandleFunc("/auth/google/callback", googleAuthCallback)

	return a
}
