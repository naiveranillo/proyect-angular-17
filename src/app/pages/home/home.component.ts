import { Component, computed, signal, effect, Injector, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';

import { Task } from '../../models/task.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  tasks = signal<Task[]>([]);

  filter = signal<'all' | 'pending' | 'completed'>('all');
  taskByFilter = computed(() => {
    const filter = this.filter();
    const tasks = this.tasks();

    if(filter === 'pending') {
      return tasks.filter(task => !task.completed);
    }

    if(filter === 'completed') {
      return tasks.filter(task => task.completed);
    }

    return tasks;
  });

  newTaskCtrl = new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required,
    ]
  });

  injector = inject(Injector);

  ngOnInit(){
    const storage = localStorage.getItem('tasks');
    if(storage) {
      const tasks = JSON.parse(storage);
      this.tasks.set(tasks);
    }
    this.trackTasks();
  }

  trackTasks(){
    effect(() => {
      const tasks = this.tasks();
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }, { injector: this.injector });
  }

  changeHandler(){
    if (this.newTaskCtrl.valid && this.newTaskCtrl.value.trim()){
      const value = this.newTaskCtrl.value;
      this.addTask(value);
      this.newTaskCtrl.setValue('');
    }
  }

  addTask(title: string){
    const newTask: Task = {
      id: Date.now(),
      title,
      completed: false,
    };

    this.tasks.update((tasks) => [...tasks, newTask]);
  }

  deleteTask(index: number){
    this.tasks.update((tasks) => tasks.filter((task, position) => position !== index));
  }

  taskCompletion(index: number){
    this.tasks.update((tasks) => 
      tasks.map((task, position) => {
        if(position === index){
          task.completed = !task.completed;
        }

        return task;
      })
    );
  }

  updateTaskEditingMode(index: number){
    this.tasks.update((tasks) => 
      tasks.map((task, position) => {
        if(position === index){
          task.editing = true;
        }else{
          task.editing = false;
        }

        return task;
      })
    );
  }

  updateTaskText(index: number, event: Event){
    const input = event.target as HTMLInputElement;
    this.tasks.update((tasks) => 
      tasks.map((task, position) => {
        if(position === index){
          task.editing = false;
          task.title = input.value;
        }

        return task;
      })
    );
  }

  changeFilter(filter: 'all' | 'pending' | 'completed'){
    this.filter.set(filter);
  }
}
