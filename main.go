package main

import (
	"github.com/urfave/negroni"
	"log"
	"net/http"
	"os"
	"todolist_go/todoList"
)

const portNumber = ":3000"

func main() {
	m := todoList.MakeNewHandler("./todolist.db")
	if m == nil {
		log.Fatal("Failed to create memory handler")
	}
	defer m.Close()

	n := negroni.Classic()
	n.UseHandler(m)

	log.Println("Started App")
	port := os.Getenv("PORT")
	err := http.ListenAndServe(":"+port, n)
	if err != nil {
		panic(err)
	}
}
