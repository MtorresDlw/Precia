'use strict';

//pdfService

module.exports = function($scope, $q, $state, notificationService){
	$scope.currentNotification = notificationService.selectedNotification;
	$scope.offlineCheck = function(item) {
	    return item.NotificationNr.substring(0,7) === "offline";
	};
	$scope.goToNotificationDetail = function(){
	    $state.go('notificationDetail');
	};

	$scope.pages = [];

	/*var pdfId = notificationService.selectAttachment.DocumentId;
	var pdfFullUrl = notificationService.selectAttachment.Data;
	var pdfBase64 = pdfFullUrl.substr(pdfFullUrl.indexOf(',') + 1);
	pdfService.getPages(pdfId, pdfBase64).then(function sendResult(result) {
	    $scope.$apply(function () {
	        $scope.pages = result;
	    });
	});*/

	var pdfLib = Windows.Data.Pdf;

	var ZOOM_FACTOR = 2;
	var PDF_PORTION_RECT = {height:3200, width:2400, x:100, y:200};
	var PDFFILENAME = notificationService.selectAttachment.DocumentId + ".pdf";

	var RENDEROPTIONS = {
	    NORMAL: 2,
	    ZOOM: 5,
	    PORTION: 4
	};

	var pdfBase64 = notificationService.selectAttachment.pdfBase64;
	Windows.Storage.ApplicationData.current.localFolder.createFileAsync(PDFFILENAME, Windows.Storage.CreationCollisionOption.replaceExisting).then(function (file) {
	    var buffUTF8 = Windows.Security.Cryptography.CryptographicBuffer.decodeFromBase64String(pdfBase64);
	    Windows.Storage.FileIO.writeBufferAsync(file, buffUTF8).then(function () {
	        renderPDFPages(PDFFILENAME,RENDEROPTIONS.NORMAL);
	    });
	});

	function renderPDFPages(pdfFileName, renderOptions) {
	    Windows.Storage.ApplicationData.current.localFolder.getFileAsync(pdfFileName).then(function loadDocument(file) {
	        // Call pdfDocument.'loadfromFileAsync' to load pdf file
	        return pdfLib.PdfDocument.loadFromFileAsync(file);
	    }).then(function setPDFDoc(doc) {
	        renderNextPage(doc, 0, renderOptions, renderNextPage)
	    });
	}

	function renderNextPage(_doc, _index, _renderOptions, _next) {
	    renderPage(_doc, _index, _renderOptions).then(function (res) {
	        _index++;
	        _next(_doc, _index, _renderOptions, renderNextPage);
	    }).error(function (data, status, headers, config, statusText) {
	    });
	}

	function renderPage(pdfDocument, pageIndex, renderOptions) {
	    var deferred = $q.defer();
	    var pageRenderOutputStream = new Windows.Storage.Streams.InMemoryRandomAccessStream();

	    // Get PDF Page
	    var pdfPage = pdfDocument.getPage(pageIndex);

	    var pdfPageRenderOptions = new Windows.Data.Pdf.PdfPageRenderOptions();
	    var renderToStreamPromise;
	    var pagesize = pdfPage.size;

	    // Call pdfPage.renderToStreamAsync
	    switch (renderOptions) {
	        case RENDEROPTIONS.NORMAL:
	            renderToStreamPromise = pdfPage.renderToStreamAsync(pageRenderOutputStream);
	            break;
	        case RENDEROPTIONS.ZOOM:
	            // Set pdfPageRenderOptions.'destinationwidth' or 'destinationHeight' to take into effect zoom factor
	            pdfPageRenderOptions.destinationHeight = pagesize.height * ZOOM_FACTOR;
	            renderToStreamPromise = pdfPage.renderToStreamAsync(pageRenderOutputStream, pdfPageRenderOptions);
	            break;
	        case RENDEROPTIONS.PORTION:
	            // Set pdfPageRenderOptions.'sourceRect' to the rectangle containing portion to show
	            pdfPageRenderOptions.sourceRect = PDF_PORTION_RECT;
	            renderToStreamPromise = pdfPage.renderToStreamAsync(pageRenderOutputStream, pdfPageRenderOptions);
	            break;
	    }

	    renderToStreamPromise.then(function Flush() {
	        return pageRenderOutputStream.flushAsync();
	    }).then(function DisplayImage() {
	            if (pageRenderOutputStream !== null) {
	                // Get Stream pointer
	                var blob = MSApp.createBlobFromRandomAccessStream("image/png", pageRenderOutputStream);
	                var page = {};
	                page.url = URL.createObjectURL(blob, { oneTimeOnly: true });

	                $scope.$apply(function () {
	                    $scope.pages.push(page);
	                    deferred.resolve(true);
	                });

	                pageRenderOutputStream.close();
	                blob.msClose();
	            }
	        },
	        function error() {
	            if (pageRenderOutputStream !== null) {
	                pageRenderOutputStream.close();

	            }
	        });

	    return deferred.promise;
	}
};
