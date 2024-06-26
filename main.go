package main

import (
	"github.com/urfave/negroni"
	"log"
	"net/http"
	"os"
	"todolist_go/todoList"
)

func main() {
	m := todoList.MakeWebHandler()
	n := negroni.Classic()
	n.UseHandler(m)

	log.Println("Started App")
	port := os.Getenv("PORT")
	err := http.ListenAndServe(":"+port, n)
	if err != nil {
		panic(err)
	}
}
