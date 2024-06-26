package model

import (
	"log"
	"time"
)

type Todo struct {
	ID        int       `json:"id,omitempty"`
	Name      string    `json:"name"`
	Completed bool      `json:"completed,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

var todoMap map[int]*Todo

func init() {
	todoMap = make(map[int]*Todo)
}

func GetTodos() []*Todo {
	list := []*Todo{}
	for _, v := range todoMap {
		list = append(list, v)
	}
	return list
}

func AddTodo(name string) *Todo {
	id := len(todoMap) + 1
	loc, err := time.LoadLocation("Asia/Seoul")
	if err != nil {
		panic(err)
	}
	now := time.Now().In(loc)
	todo := &Todo{id, name, false, now}
	todoMap[id] = todo
	log.Println("add Todo success")
	return todo
}

func RemoveTodo(id int) bool {
	if _, ok := todoMap[id]; ok {
		delete(todoMap, id)
		return true
	}
	return false
}

func CompleteTodo(id int, complete bool) bool {
	if todo, ok := todoMap[id]; ok {
		todo.Completed = complete
		return true
	}
	return false
}
