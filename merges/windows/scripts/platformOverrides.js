'use strict';

/*global Windows:false */
/*global cordova:false */
(function () {
  var scriptElem = document.createElement('script');
  scriptElem.setAttribute('src', 'scripts/winstore-jscompat.js');
  if (document.body) {
    document.body.appendChild(scriptElem);
  } else {
    document.head.appendChild(scriptElem);
  }
  cordova.file = {
    tempDirectory: 'ms-appdata:///temp/',
    dataDirectory: 'ms-appdata:///local/',
    documentsDirectory: 'ms-appdata:///local/'
  };

  var applicationData = Windows.Storage.ApplicationData.current;

  window.nativeFunctions = {
    openFile: function (fileName) {
      applicationData.localFolder.getFileAsync(fileName).then(function (file) {
        var options = new Windows.System.LauncherOptions();
        options.desiredRemainingView = Windows.UI.ViewManagement.ViewSizePreference.useHalf;
        Windows.System.Launcher.launchFileAsync(file);
      });
    }
  };

  //Disable SQLite plugin, use websql plugin instead
  document.addEventListener('deviceready', function () {
    window.sqlitePlugin = undefined;
  });
}());
