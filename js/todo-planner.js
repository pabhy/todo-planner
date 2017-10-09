(function() {
  'use strict';

  var Task = function(text) {
    this.id = Date.now();
    this.description = text;
    this.isPriority = false;
  }

  var MODEL = function() {

  }();

  var VIEW = function(Task) {

    var _taskList = [],
        _taskListElement = document.getElementById('task-list');

    var _getTask = function(id) {
      id = Number.parseInt(id);
      return _taskList.filter(function(task) {
        return task.id === id;
      }).reduce(function(acc, task) {
        return task;
      });
    }

    var _clearTaskList = function(Task) {
      while (_taskListElement.hasChildNodes()) {
        _taskListElement.removeChild(_taskListElement.lastChild);
      }
    }

    var _renderTask = function(markup) {
      var _taskElement = document.createElement('li');
      _taskElement.innerHTML = markup;
      _taskListElement.appendChild(_taskElement);
    }

    var _reloadTaskList = function() {
      _clearTaskList();
      _taskList.map(function(task, index) {
        _renderTask(_createTaskMarkup(task, index + 1));
      });
    }

    var _createTaskMarkup = function(task, serial) {
      return '<ul class="task">' +
        '<li>' +
          '<button class="task-serial" id="serial-' + task.id + '">' + serial + '</button>' +
        '</li>' +
        '<li class="task-description">' +
          '<input type="text" maxlength="90"' +
            'id="description-' + task.id + '" value="' + task.description + '">' +
        '</li>' +
        '<li class="task-star">' +
          '<button id="star-' + task.id + '">' +
            '<i id="icon-' + task.id + '" class="fa fa-star"></i>' +
          '</button>' +
        '</li>' +
      '</ul>';
    }

    var _addTask = function(task) {
      _taskList.push(task);
      _reloadTaskList();
    }

    var _toggleColor = function(id, isPriority) {
      var _starIcon = document.getElementById('star-' + id),
          ISPRIORITY_TRUE_COLOR = '#ffc38e',
          ISPRIORITY_FALSE_COLOR = '#dfe4e6';
      _starIcon.style.color = (isPriority) ? ISPRIORITY_TRUE_COLOR : ISPRIORITY_FALSE_COLOR;
    }

    var deleteTask = function(taskId) {
      taskId = Number.parseInt(taskId);
      _taskList = _taskList.filter(function(task) {
        return task.id !== taskId;
      });
      _reloadTaskList();
    }

    var toggleTaskStar = function(id) {
      var task = _getTask(id);
      task.isPriority = !task.isPriority;
      _toggleColor(id, task.isPriority);
    }

    var saveTask = function(id, description) {
      var task = _getTask(id);
      task.description = description;
    }

    var init = function() {
      addTaskBtn.disabled = true;
      addTaskDescription.addEventListener('keyup', function() {
        addTaskBtn.disabled = (addTaskDescription.value.trim()) ? false : true;
      });

      actionBarForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (addTaskDescription.value.trim()) {
          _addTask(new Task(addTaskDescription.value));
        }
        addTaskDescription.value = '';
        addTaskBtn.disabled = true;
      });
    }

    return {
      init: init,
      deleteTask: deleteTask,
      toggleTaskStar: toggleTaskStar,
      saveTask: saveTask
    };

  }(Task);

  var CONTROLLER = function(view, model) {

    var _taskListElement = document.getElementById('task-list');
    var _menuBar = document.getElementById('menu');

    var _setupListeners = function() {
      _taskListElement.addEventListener('click', function(e) {
        var _target = e.target.id.split('-')[0],
            _id = e.target.id.split('-')[1];

        if (_target === 'serial') {
          view.deleteTask(_id);
        } else if (_target === 'star' || _target === 'icon') {
          view.toggleTaskStar(_id);
        }
      });

      _taskListElement.addEventListener('blur', function(e) {
        var _target = e.target.id.split('-')[0],
            _id = e.target.id.split('-')[1];
        if (_target === 'description') {
          view.saveTask(_id, e.target.value);
        }
      }, true);


      _menuBar.addEventListener('click', function(e) {
        if (e.target.id === 'exportBtn') {

        }
      });
    }

    //Entry point of the application
    var _init = function() {
      view.init();
      _setupListeners();
    }();

  }(VIEW, MODEL);

})();