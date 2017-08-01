'use strict';

module.exports = function($q, $translate, toaster) {
	var cordova = false,
		os = {
			android: 'Android',
			windows: 'windows',
			ios: 'iOS'
		};

	var self = this;

	if (window.cordova) {
		cordova = true;
	}

	self.getPlatform = function() {
		if (cordova) {
			return device.platform;
		}
		return '';
	};

	self.takePicture = function() {
		var d = $q.defer();
		if (cordova) {
			navigator.camera.getPicture(function(res) {
				d.resolve(res);
			}, function(err) {
				self.alert(JSON.stringify(err));
				d.reject(err);
			}, {
				destinationType: navigator.camera.DestinationType.DATA_URL,
				sourceType: navigator.camera.PictureSourceType.CAMERA,
			});
		} else {
			console.warn('Cordova not activated, cannot access camera');
			d.reject(false);
		}
		return d.promise;
	};

	self.getBarcode = function() {
		var d = $q.defer();

		if (cordova) {
			cordova.plugins.barcodeScanner.scan(
				function(result) {
					d.resolve(result.text);
				},
				function(err) {
					console.error(err);
					d.reject(err);
				});
		} else {
			console.warn('Cordova not activated, cannot access barcode scanner.');
			d.reject(false);
		}

		return d.promise;
	};

	self.open = function(blob) {
		if(cordova){
			self.safeFileBlob(blob, blob.type).then(function(uri) {
				self.openFile(uri, blob.type);
			});
		}else{
			var reader = new window.FileReader();
			reader.readAsDataURL(blob);
			reader.onloadend = function() {
				window.open(reader.result);
			};
		}
	};

	self.safeFileBlob = function(blob, type) {
		var d = $q.defer();
		var fileName = 'TempFAFile.' + type.split('/')[1];

		if (cordova) {
			var platform = self.getPlatform();

			if (platform === os.android) {
				window.resolveLocalFileSystemURL(window.cordova.file.externalApplicationStorageDirectory, function(dirEntry) {
					dirEntry.getFile(fileName, {
						create: true
					}, function(fileEntry) {
						fileEntry.createWriter(function(fileWriter) {

							fileWriter.onwriteend = function(e) {
								console.info('Write completed.');
								d.resolve(fileEntry.nativeURL);
							};

							fileWriter.onerror = console.error;

							fileWriter.write(blob);

						}, console.error);

					}, function(err) {
						console.error(err);
					});
				}, function(err) {
					console.error(err);
				});
			} else if (platform === os.windows) {
				var reader = new FileReader(),
					fileData = {};
				reader.onload = function() {
					fileData.Data = reader.result;
					fileData.pdfBase64 = fileData.Data.substr(fileData.Data.indexOf(',') + 1);

					Windows.Storage.ApplicationData.current.localFolder
						.createFileAsync(fileName, Windows.Storage.CreationCollisionOption.replaceExisting)
						.then(function(file) {
							var buffUTF8 = Windows.Security.Cryptography.CryptographicBuffer.decodeFromBase64String(fileData.pdfBase64);

							return Windows.Storage.FileIO.writeBufferAsync(file, buffUTF8);
						})
						.then(function() {
							return Windows.Storage.ApplicationData.current.localFolder.getFileAsync(fileName);
						}).then(function(file) {
							d.resolve(file.path);
						});
				};
				reader.readAsDataURL(blob);
			} else {
				console.warn('Saving not implemented for this platform.');
				toaster.pop('warning', $translate.instant('open_file'), $translate.instant('platformNotSupported'), 3000);

				d.reject(false);
			}
		} else {
			console.warn('No cordova detected, file cannot be saved.');
			d.reject(false);
		}
		return d.promise;
	};

	self.openFile = function(uri, type) {
		var platform = self.getPlatform();
		if (cordova) {
			if (platform === os.android) {
				window.cordova.plugins.fileOpener2.open(uri, type);
			} else if (platform === os.windows) {
				Windows.Storage.StorageFile.getFileFromPathAsync(uri).then(function(file) {
					var options = new Windows.System.LauncherOptions();
					options.displayApplicationPicker = false;

					Windows.System.Launcher.launchFileAsync(file, options).then(function(success) {
						if (!success) {
							console.error('File could not be opened');
							self.alert($translate.instant('errorFileOpen'), $translate.instant('open_file'));
						}
					});
				});
			} else {
				console.warn('openFile not supported on this platform');

			}
		} else {
			console.warn('openFile only supported with cordova');
		}
	};

	//cordova alerts
	self.alert = function(msg, title, buttonLabel) {
		if (cordova) {
			if (!title) {
				title = '';
			}
			if (!buttonLabel) {
				buttonLabel = 'OK';
			}
			navigator.notification.alert(msg, function() {}, title, buttonLabel);
		} else {
			window.alert(msg);
		}
	};

	self.confirm = function(msg, title, buttonLabels, callbacks) {
		if (cordova) {
			navigator.notification.confirm(msg, function(index) {
				callbacks[index - 1]();
			}, title, buttonLabels);
		} else {
			window.alert(msg);
		}
	};
};
