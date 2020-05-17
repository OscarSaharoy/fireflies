// Oscar Saharoy 2020

(function () {

	class Fly {
		constructor(x, y) {
			this.vx   = 0;
			this.vy   = 0;
			this.x    = x;
			this.y    = y;
			this.c    = 0;
		}

		draw(canvasData) {

			// draw fly to screen (manual rendering)

			var ix = Math.floor(this.x);
			var iy = Math.floor(this.y);

			var i = -6;
			var j = -6;

			var mdm = Math.sqrt( (mx-this.x)*(mx-this.x) + (my-this.y)*(my-this.y) );

			var a = Math.pow( 2, -0.0002 * (mdm)*(mdm));

			if(this.c && a < 0.2) {
				a = 0.2;
				this.c -= 1;
			}
			else if(!this.c && Math.random() > 0.9997) {
				this.c = 100;
			}

			if(a<0.01) {
				return;
			}

			for(var t = 0; t < 169; t++) {
				var ox = ix + i;
				var oy = iy + j;

				var dx = ox - this.x;
				var dy = oy - this.y;

				var dm = dx*dx + dy*dy;

				//var alpha = ( 1 - Math.pow(dm, 1/5)/2.2 ) * 255;
				var alpha = ( 1 - Math.sqrt(dm)/7 ) * 100 + Math.max(( 2 - Math.sqrt(dm) ) * 255, 0);

				// set pixel values if alpha is positive and pixel is onscreen (pixel should be drawn)
				if(alpha > 0 && ox < w && ox > 0) {
					var ind = (ox + oy*w)*4 + 3;
					canvasData.data[ind] += alpha*a;
					alphaindexes.push(ind);
				}

				j++;
				if(j==7) {
					j = -6;
					i++;
				}
			}
		}

		compute() {

			var dx = this.x - mx;
			var dy = this.y - my;
			var dm = Math.sqrt(dx*dx + dy*dy);

			var a  = pow * Math.pow( 2, -0.0002 * (dm)*(dm));

			this.vx += (Math.random() * 0.1 - 0.05) - drag * this.vx - a * dx/dm;
			this.vy += (Math.random() * 0.1 - 0.05) - drag * this.vy - a * dy/dm;

			this.x   = (this.x + this.vx) % w;
			this.y   = (this.y + this.vy) % w;

			(this.x < 0) ? this.x += w : null;
			(this.x < 0) ? this.y += h : null;
		}
	}

	var c    = document.getElementById("canvas");
	var ctx  = c.getContext("2d");

	var d    = 40;
	var dots = [];

	var w, h, ny, nx, n, os;
	resize();
	var ndx  = [0, 1, 1, -1, -2, -1, 0, 1, 2, 2];
	var ndy  = [1, 0, 1, 1, 1, 2, 2, 2, 1, 0];

	var mx   = -100;
	var my   = -100;

	var alphaindexes = [];

	var drag = 0.01;
	var stif = 0.005;
	var pow  = 0.04;


	function resize() {
		w    = c.offsetWidth;  // screen width of canvas in px
		h    = c.offsetHeight; // screen height of canvas in px

		// set canvas width to its screen width
		c.width    = w;
		c.height   = h;
		
		// get array of pixel values
		canvasData = ctx.createImageData(w, h);

		// set to all gold
		for(var s = 0; s < w*h; s++) {
			canvasData.data[s*4 + 0] = 255;
			canvasData.data[s*4 + 1] = 230;
			canvasData.data[s*4 + 2] = 0;
		}

		// calculate number of dots in the x and y directions
		ny     = Math.ceil(h/d) + 2;
		nx     = Math.ceil(w/d) + 2;
	    n      = nx * ny;

		dots   = [];

		var gx = -d*0.5;
		var gy = -d*0.5;

		for(i=0; i<ny; i++) {

			for(j=0; j<nx; j++) {

				dots.push( new Fly(gx, gy) );
				gx  += d;
			}

			gx  = -d*0.5;
			gy += d;
		}
	}


	function mousemove(e) {

		mx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		my = e.clientY + document.body.scrollTop + document.documentElement.scrollTop
	}

	window.addEventListener('resize', resize);
	window.addEventListener('mousemove', mousemove);

	function animate() {

		for(z = 0; z < n; z++) {

			dots[z].compute();
		}

		// clear screen
		for(const u of alphaindexes) {
			canvasData.data[u] = 0;
		}

		alphaindexes = [];

		for(z = 0; z < n; z++) {

			dots[z].draw(canvasData);
		}

		ctx.putImageData(canvasData, 0, 0);
		
		requestAnimationFrame(animate);
	}

	animate();

})();