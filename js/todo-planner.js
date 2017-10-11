(function() {
  'use strict';

  var Task = function(text) {
    this.id = Date.now();
    this.description = text;
    this.isPriority = false;
  }

  var STORAGE = function() {
    var STORAGE_KEY = 'TODO_PLANNER';

    var read = function() {
      if (localStorage) {
        var _data = localStorage.getItem(STORAGE_KEY);
        return ((_data) ? JSON.parse(_data) : []);
      }
      return [];
    }

    var write = function(data) {
      if (localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    }

    return {
      read: read,
      write: write
    }

  }();

  var VIEW = function(Task, storage) {

    var _taskList = [],
        _undoStack = [],
        _redoStack = [],
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
        _setStarColor(task.id, task.isPriority);
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
      _undoStack.push(JSON.parse(JSON.stringify(_taskList)));
      _taskList.push(task);
      storage.write(_taskList);
      _reloadTaskList();
    }

    var _setStarColor = function(id, isPriority) {
      var _starIcon = document.getElementById('star-' + id),
          ISPRIORITY_TRUE_COLOR = '#ffc38e',
          ISPRIORITY_FALSE_COLOR = '#dfe4e6';
      _starIcon.style.color = (isPriority) ? ISPRIORITY_TRUE_COLOR : ISPRIORITY_FALSE_COLOR;
    }

    var deleteTask = function(taskId) {
      taskId = Number.parseInt(taskId);
      _undoStack.push(JSON.parse(JSON.stringify(_taskList)));
      _taskList = _taskList.filter(function(task) {
        return task.id !== taskId;
      });
      storage.write(_taskList);
      _reloadTaskList();
    }

    var toggleTaskStar = function(id) {
      _undoStack.push(JSON.parse(JSON.stringify(_taskList)));
      var task = _getTask(id);
      task.isPriority = !task.isPriority;
      _setStarColor(id, task.isPriority);
      storage.write(_taskList);
    }

    var saveTask = function(id, description) {
      var task = _getTask(id);
      task.description = description;
      storage.write(_taskList);
    }

    var exportTasks = function() {
      if (_taskList.length > 0) {
        var INDENT_TAB_SIZE = 2,
            downloadLink = document.getElementById('downloadLink');
        var exportContent = 'data:text/json;charset=utf-8,' +
          encodeURIComponent(JSON.stringify(_taskList, null, INDENT_TAB_SIZE));
        downloadLink.setAttribute('href', exportContent);
        downloadLink.setAttribute('download', 'todo_tasks_' + Date.now() +'.json');
        downloadLink.click();
      }
    }

    var importTasks = function() {
      var _importLink = document.getElementById('importLink'),
          _fileReader = new FileReader();

      _fileReader.onload = function(e) {
        var _data = JSON.parse(e.target.result);
        _importLink.value = '';
        if (Array.isArray(_data)) {
          _data.map(function(task) {
            _addTask(task);
          });
        }
      }

      _importLink.onchange = function() {
        if (_importLink.files.length > 0) {
          _fileReader.readAsText(_importLink.files[0], 'UTF-8');
        }
      }

      _importLink.click();
    }

    var undo = function() {
      if (_undoStack.length > 0) {
        _taskList = _undoStack.pop();
        _redoStack.push(JSON.parse(JSON.stringify(_taskList)));
        storage.write(_taskList);
        _reloadTaskList();
      }
    }

    var redo = function() {
      if (_redoStack.length > 0) {
        _taskList = _redoStack.pop();
        _undoStack.push(JSON.parse(JSON.stringify(_taskList)));
        storage.write(_taskList);
        _reloadTaskList();
      }
    }

    var init = function() {
      addTaskBtn.disabled = true;

      _taskList = storage.read();
      _reloadTaskList();

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
      saveTask: saveTask,
      exportTasks: exportTasks,
      importTasks: importTasks,
      undo: undo,
      redo: redo
    };

  }(Task, STORAGE);

  var CONTROLLER = function(view) {

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
        if (e.target.id === 'undoBtn') {
          view.undo();
        } else if (e.target.id === 'redoBtn') {
          view.redo();
        }else if (e.target.id === 'exportBtn') {
          view.exportTasks();
        } else if (e.target.id === 'importBtn') {
          view.importTasks();
        }
      });
    }

    //Entry point of the application
    var _init = function() {
      view.init();
      _setupListeners();
    }();

  }(VIEW);

})();