import { Component } from '@angular/core';

import { Task } from '@take-home/shared';
import { take } from 'rxjs';
import { TasksService } from '../tasks.service';
import { Router } from '@angular/router';
import { StorageService } from '../../storage/storage.service';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';

@Component({
  selector: 'take-home-list-component',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  standalone: false,
  // TODO Fix animation showing up after adding task
  animations: [
    // the fade-in/fade-out animation.
    trigger('simpleFadeAnimation', [
      // fade out when destroyed. this could also be written as transition('void => *')
      transition(':leave', animate(400, style({ opacity: 0 }))),
    ]),
  ],
})
export class ListComponent {
  constructor(
    private storageService: StorageService,
    protected tasksService: TasksService,
    private router: Router,
  ) {
    this.getTaskList();
  }

  onDoneTask(item: Task): void {
    item.completed = true;
    this.storageService.updateTaskItem(item);
  }

  onDeleteTask(item: Task): void {
    item.isArchived = true;
    this.storageService.updateTaskItem(item);
    this.tasksService.filterTask('isArchived');
  }

  onAddTask(): void {
    this.router.navigate(['add']);
  }

  private getTaskList(): void {
    this.tasksService
      .getTasksFromApi()
      .pipe(take(1))
      .subscribe(async (tasks) => {
        tasks.forEach(async (task) => {
          await this.storageService.updateTaskItem(task);
        });
        await this.tasksService.getTasksFromStorage();
      });
  }
}
