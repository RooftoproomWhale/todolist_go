package todoList

import (
	"github.com/gorilla/mux"
	"github.com/unrolled/render"
	"log"
	"net/http"
	"strconv"
	"todolist_go/model"
)

var rd = render.New()

type AppHandler struct {
	http.Handler
	db model.DBHandler
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

func MakeNewHandler(filepath string) *AppHandler {

	mux := mux.NewRouter()
	dbHandler := model.NewDBHandler(filepath)
	if dbHandler == nil {
		log.Fatal("Failed to initialize database handler")
	}
	a := &AppHandler{
		Handler: mux,
		db:      dbHandler,
	}
	mux.HandleFunc("/", a.indexHandler)
	mux.HandleFunc("/todos", a.getTodoListHandler).Methods("GET")
	mux.HandleFunc("/todos", a.addTodoHandler).Methods("POST")
	mux.HandleFunc("/todos/{id:[0-9]+}", a.removeTodoHandler).Methods("DELETE")
	mux.HandleFunc("/complete-todo/{id:[0-9]+}", a.completeTodoHandler).Methods("GET")
	return a
}
