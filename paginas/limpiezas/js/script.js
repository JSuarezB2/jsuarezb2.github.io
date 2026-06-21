document.addEventListener('DOMContentLoaded', () => {
	// Mapa de galerías detectadas en ./img
	const galleries = {
		'clasico-pecho': [
			'./img/clasico-pecho/original.jpeg',
			'./img/clasico-pecho/separada.png',
			'./img/clasico-pecho/limpia.png'
		],
		'clasico-espalda': [
			'./img/clasico-espalda/original.jpeg',
			'./img/clasico-espalda/separada.png',
			'./img/clasico-espalda/limpia.png'
		],
		'pantera': [
			'./img/pantera/original.jpeg',
			'./img/pantera/separada.png',
			'./img/pantera/limpia.png'
		]
	};

	const select = document.getElementById('gallerySelect');
	const slidesRoot = document.getElementById('slides');
	const indicatorsRoot = document.getElementById('indicators');
	const prevBtn = document.getElementById('prevBtn');
	const nextBtn = document.getElementById('nextBtn');

	let currentGallery = null;
	let currentIndex = 0;

	// Orden preferido: original, separada, limpia
	const preferredOrder = ['original', 'separada', 'limpia'];

	function humanize(key){
		return key.replace(/[-_]/g,' ').replace(/\b\w/g, c => c.toUpperCase());
	}

	function sortByPreferred(files){
		const lower = files.slice();
		lower.sort((a,b)=>{
			const na = preferredOrder.findIndex(k=>a.toLowerCase().includes(k));
			const nb = preferredOrder.findIndex(k=>b.toLowerCase().includes(k));
			if(na === -1 && nb === -1) return 0;
			if(na === -1) return 1;
			if(nb === -1) return -1;
			return na - nb;
		});
		return lower;
	}

	// Poblar select con las claves del objeto galleries
	function populateSelect(){
		Object.keys(galleries).forEach((key, i) => {
			const opt = document.createElement('option');
			opt.value = key;
			opt.textContent = humanize(key);
			select.appendChild(opt);
		});
	}

	function clearSlides(){
		slidesRoot.innerHTML = '';
		indicatorsRoot.innerHTML = '';
	}

	function showSlide(idx){
		const slides = slidesRoot.querySelectorAll('.slide');
		const indicators = indicatorsRoot.querySelectorAll('button');
		if(slides.length === 0) return;
		idx = (idx + slides.length) % slides.length;
		slides.forEach(s=>s.classList.remove('active'));
		indicators.forEach(i=>i.classList.remove('active'));
		slides[idx].classList.add('active');
		indicators[idx].classList.add('active');
		currentIndex = idx;
	}

	function loadGallery(key){
		currentGallery = key;
		clearSlides();
		let images = galleries[key] ? galleries[key].slice() : [];
		images = sortByPreferred(images);

		function getLabelFromSrc(src){
			try{
				const parts = src.split('/');
				const file = parts[parts.length-1];
				const name = file.replace(/\.[^/.]+$/, '');
				return name.replace(/[-_]/g,' ').replace(/\b\w/g, c => c.toUpperCase());
			}catch(e){return src}
		}

		images.forEach((src, idx) => {
			const s = document.createElement('div');
			s.className = 'slide';
			s.setAttribute('role','group');
			s.setAttribute('aria-roledescription','slide');
			s.setAttribute('aria-label', `${idx+1} de ${images.length}`);

			const img = document.createElement('img');
			img.src = src;
			img.alt = humanize(key) + ' ' + (idx+1);
			s.appendChild(img);

			const label = document.createElement('div');
			label.className = 'slide-label';
			label.textContent = `${idx+1}/${images.length} — ${getLabelFromSrc(src)}`;
			s.appendChild(label);

			slidesRoot.appendChild(s);

			const dot = document.createElement('button');
			dot.setAttribute('aria-label', `Ir a ${idx+1}`);
			dot.addEventListener('click', ()=> showSlide(idx));
			indicatorsRoot.appendChild(dot);
		});

		// activar el primero
		currentIndex = 0;
		showSlide(0);
	}

	// Navegación
	function next(){ showSlide(currentIndex + 1); }
	function prev(){ showSlide(currentIndex - 1); }

	prevBtn.addEventListener('click', prev);
	nextBtn.addEventListener('click', next);

	// teclado
	window.addEventListener('keydown', (e)=>{
		if(e.key === 'ArrowLeft') prev();
		if(e.key === 'ArrowRight') next();
	});

	// swipe táctil básico
	(function addTouch(){
		let startX = 0;
		slidesRoot.addEventListener('pointerdown', (e)=>{ startX = e.clientX; slidesRoot.setPointerCapture(e.pointerId); });
		slidesRoot.addEventListener('pointerup', (e)=>{ const diff = e.clientX - startX; if(diff > 40) prev(); else if(diff < -40) next(); });
	})();

	// cuando cambie el select
	select.addEventListener('change', (e)=>{
		loadGallery(e.target.value);
	});

	// Init
	populateSelect();
	if(select.options.length > 0){
		select.selectedIndex = 0;
		loadGallery(select.options[0].value);
	}
});
