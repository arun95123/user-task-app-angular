import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import Fuse from 'fuse.js';
import { Task } from '@take-home/shared';
import { StorageService } from '../storage/storage.service';

@Injectable({ providedIn: 'root' })
export class TasksService {
  tasks: Task[] = [];

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
  ) {}

  getTasksFromApi(): Observable<Task[]> {
    const endpointUrl = '/api/tasks';
    return this.http.get<Task[]>(endpointUrl);
  }

  async getTasksFromStorage(): Promise<void> {
    this.tasks = await this.storageService.getTasks();
    this.filterTask('isArchived');
  }

  filterTask(key: keyof Task): void {
    switch (key) {
      case 'isArchived':
        this.tasks = this.tasks.filter((task) => !task.isArchived);
        break;
      case 'priority':
        this.tasks = this.tasks.filter((task) => task.priority === 'HIGH');
        break;
      case 'scheduledDate':
        this.tasks = this.tasks.filter((task) => {
          if (!task.scheduledDate) {
            return false;
          }
          const scheduledDate = new Date(task.scheduledDate);
          return scheduledDate.toDateString() === new Date().toDateString();
        });
        break;
      case 'completed':
        this.tasks = this.tasks.filter((task) => !task.completed);
    }
  }

  async searchTask(search: string): Promise<void> {
    const allTasks = await this.storageService.getTasks();
    const fuse = new Fuse(allTasks, { keys: ['title'] });
    if (search) {
      this.tasks = fuse.search(search).map((result) => result.item);
    } else {
      this.tasks = allTasks;
    }
  }
}
