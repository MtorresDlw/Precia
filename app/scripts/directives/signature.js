'use strict';

module.exports = function() {
	return {
		restrict: "A",
		scope: {
			name: '=signatureName',
			data: '=signatureData',
			cb: '=signatureCb'
		},
		link: function(scope, element) {
			var ctx = element[0].getContext('2d');

			// variable that decides if something should be drawn on mousemove
			var drawing = false;

			// the last coordinates before the current move
			var lastX;
			var lastY;

			element.bind('touchstart', function(event) {
				if (event.offsetX !== undefined) {
					lastX = event.offsetX;
					lastY = event.offsetY;
				} else { // Firefox compatibility
					var e = event.touches[0];
					lastX = e.pageX - event.currentTarget.offsetLeft;
					lastY = e.pageY - event.currentTarget.offsetTop;
				}

				// begins new line
				ctx.beginPath();

				drawing = true;
			});

			element.bind('touchmove', function(event) {
				var currentX, currentY;
				if (drawing) {
					// get current mouse position
					if (event.offsetX !== undefined) {
						currentX = event.offsetX;
						currentY = event.offsetY;
					} else {
						var e = event.touches[0];
						currentX = e.pageX - event.currentTarget.offsetLeft;
						currentY = e.pageY - event.currentTarget.offsetTop;
					}

					draw(lastX, lastY, currentX, currentY);

					// set current coordinates to last one
					lastX = currentX;
					lastY = currentY;
				}
			});

			element.bind('touchend', function() {
				// stop drawing
				drawing = false;
				scope.cb(getImgContent());
			});

			element.bind('mousedown', function(event) {
				if (event.offsetX !== undefined) {
					lastX = event.offsetX;
					lastY = event.offsetY;
				} else { // Firefox compatibility
					lastX = event.layerX - event.currentTarget.offsetLeft;
					lastY = event.layerY - event.currentTarget.offsetTop;
				}

				// begins new line
				ctx.beginPath();

				drawing = true;
			});

			element.bind('mousemove', function(event) {
				var currentX, currentY;
				if (drawing) {
					// get current mouse position
					if (event.offsetX !== undefined) {
						currentX = event.offsetX;
						currentY = event.offsetY;
					} else {
						currentX = event.layerX - event.currentTarget.offsetLeft;
						currentY = event.layerY - event.currentTarget.offsetTop;
					}

					draw(lastX, lastY, currentX, currentY);

					// set current coordinates to last one
					lastX = currentX;
					lastY = currentY;
				}

			});

			element.bind('mouseup', function() {
				// stop drawing
				drawing = false;
				scope.cb(getImgContent());
			});

			scope.$on('resetCanvas', function() {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
			});

			//get content from canvas
			function getImgContent() {
				var el = element[0];

				//create a dummy CANVAS
				var dummyCvs = document.createElement("canvas");
				dummyCvs.width = el.width;
				dummyCvs.height = el.height;

				var destCtx = dummyCvs.getContext('2d');

				destCtx.font = "20px Georgia";
				destCtx.fillText(scope.name, 10, 5);

				//create a rectangle with the desired color
				destCtx.fillStyle = "#FFFFFF";
				destCtx.fillRect(0, 0, el.width, el.height);

				//draw the original canvas onto the destination canvas
				destCtx.drawImage(el, 0, 0);

				return dummyCvs.toDataURL('image/jpeg');
			}

			scope.$watch('name', function(newVal) {
				if (newVal !== undefined) {
					clearCanvas(element[0]);
					ctx.font = "20px arial";
					ctx.fillText(newVal, 10, 30);
				}
			});

			function clearCanvas(cnv) {
				ctx.beginPath(); // clear existing drawing paths
				ctx.save(); // store the current transformation matrix

				// Use the identity matrix while clearing the canvas
				ctx.setTransform(1, 0, 0, 1, 0, 0);
				ctx.clearRect(0, 0, cnv.width, cnv.height);

				ctx.restore();
			}

			function putImgContent(imageData) {
				var image = new Image();
				image.src = imageData;
				image.onload = function() {
					ctx.drawImage(image, 0, 0);
				};
			}

			scope.$watch('data', function(data) {
				if (data) {
					putImgContent(data);
				}
			});

			function draw(lX, lY, cX, cY) {
				if (!scope.saving) {
					// line from
					ctx.moveTo(lX, lY);
					// to
					ctx.lineTo(cX, cY);
					// color
					ctx.strokeStyle = "#4bf";
					// draw it
					ctx.stroke();
				}
			}
		}
	};
};
