const ITEMS_PER_PAGE = 3;
const SCROLL_DELAY = 750;
const TRANSITION = 750;
let enableScroll = true;
let touchStartY;
let touchEndY;

window.addEventListener(
	"wheel",
	function (event) {
		event.preventDefault();
		if (!enableScroll) return;
		if (event.deltaY > 0) app.nextItem();
		else app.prevItem();
		enableScroll = false;
		setTimeout(() => (enableScroll = true), SCROLL_DELAY);
	},
	{ passive: false }
);

document.addEventListener("touchstart", function (e) {
	touchStartY = e.touches[0].pageY;
});

document.addEventListener("touchmove", function (e) {
	if (!enableScroll) return;
	touchEndY = e.touches[0].pageY;
	if (touchStartY < touchEndY) {
		app.prevItem();
		enableScroll = false;
		setTimeout(() => (enableScroll = true), SCROLL_DELAY);
	} else if (touchStartY > touchEndY) {
		app.nextItem();
		enableScroll = false;
		setTimeout(() => (enableScroll = true), SCROLL_DELAY);
	}
});

document.addEventListener("touchend", function (e) {
	touchStartY = null;
	touchEndY = null;
});

class Subject {
	constructor(year, title, subtitle, img, sketch) {
		this.year = year;
		this.title = title;
		this.subtitle = subtitle;
		this.img = img;
		this.sketch = sketch;
	}
}

let app = Vue.createApp({
	data() {
		return {
			list: [
				new Subject(2020, "ROMA V&A5 H", "羅馬VA5", "ROMA V&A5 H 2020.png", "ROMA V&A5 H 2020_sketch.png"),
				new Subject(2020, "ROMA V&A5 B", "羅馬VA5", "ROMA V&A5 B 2020.png", "ROMA V&A5 B 2020_sketch.png"),
				new Subject(2018, "BAOREN VA3", "成大寶仁VA3", "BAOREN V&A3 2018.jpg", "BAOREN V&A3 2018_sketch.png"),
				//new Subject(2023, "LOMA VA5", "羅馬VA5", "VA5羅馬大圖.jpg", "VA5羅馬.png"),
				//new Subject(2024, "BAOREN VA3", "成大保仁VA3", "VA5羅馬大圖02.jpg", "VA2.png"),
				//new Subject(2024, "BAOREN VA3", "成大保仁VA3", "VA5羅馬大圖03.jpg", "VA6成大寶仁.png"),
				//new Subject(2023, "LOMA VA5", "羅馬VA5", "VA5羅馬大圖.jpg", "VA5羅馬.png"),
				//new Subject(2024, "BAOREN VA3", "成大保仁VA3", "VA5羅馬大圖02.jpg", "VA2.png"),
				//new Subject(2024, "BAOREN VA3", "成大保仁VA3", "VA5羅馬大圖03.jpg", "VA6成大寶仁.png"),
			],
			activeIndex: 0,
			prevIndex: 0,
			title: "",
			subtitle: "",
			animation: false,
		};
	},
	methods: {
		init() {
			this.title = this.list[0].title;
			this.subtitle = this.list[0].subtitle;
			this.doAnimate(1, 0);
		},
		setItem(index) {
			this.prevIndex = this.activeIndex;
			this.activeIndex = index;
			if (this.prevIndex != this.activeIndex) this.doAnimate(this.prevIndex, this.activeIndex);
		},
		prevItem() {
			this.prevIndex = this.activeIndex;
			this.activeIndex = Math.max(0, this.activeIndex - 1);
			if (this.prevIndex != this.activeIndex) this.doAnimate(this.prevIndex, this.activeIndex);
		},
		nextItem() {
			this.prevIndex = this.activeIndex;
			this.activeIndex = Math.min(this.list.length - 1, this.activeIndex + 1);
			if (this.prevIndex != this.activeIndex) this.doAnimate(this.prevIndex, this.activeIndex);
		},
		doAnimate(from, to) {
			this.animation = true;
			this.changeYear(this.list[this.activeIndex].year.toString(), "bar-title-year", "#left .number");
			this.changeYear(this.list[this.activeIndex].year.toString(), "title-year", "#middle .number");
			this.changeImage(from, to, "images");
			this.changeImage(from, to, "sketchs");
			setTimeout(() => {
				this.title = this.list[this.activeIndex].title;
				this.subtitle = this.list[this.activeIndex].subtitle;
			}, TRANSITION / 2);
			setTimeout(() => (this.animation = false), TRANSITION);
		},
		changeYear(newYear, ref, numSelector) {
			const yearEl = this.$refs[ref];
			const oldYear = yearEl.textContent;
			const newYearEls = newYear.split("").map((number, index) => {
				const oldNumber = oldYear[index];
				if (number === oldNumber && index != 3) return `<span>${number}</span>`;
				else return `<span class="number"><span>${oldNumber}</span>${number}</span>`;
			});
			yearEl.innerHTML = newYearEls.join("");
			const newNumberEls = document.querySelectorAll(numSelector);
			newNumberEls.forEach(numberEl => {
				const oldNumberEl = numberEl.querySelector("span:first-child");
				const newNumberEl = numberEl.querySelector("span:last-child");
				oldNumberEl.addEventListener("animationend", () => {
					oldNumberEl.remove();
					newNumberEl.style.opacity = 1;
					newNumberEl.style.animation = "none";
				});
			});
		},
		changeImage(from, to, imgSelector) {
			let images = this.$refs[imgSelector];
			images.forEach(i => {
				i.classList.remove("top");
				i.classList.remove("bottom");
			});
			let direction = from < to ? "up" : "down";
			const currentImage = images[to];
			const previousImage = images[from];

			currentImage.classList.add("current");
			previousImage.classList.add("previous");
			currentImage.classList.add(direction);
			previousImage.classList.add(direction);

			setTimeout(() => {
				previousImage.classList.remove("previous");
				previousImage.classList.remove("current");
				currentImage.classList.remove(direction);
				previousImage.classList.remove(direction);
				if (from < to) {
					previousImage.classList.add("top");
					images[to + 1].classList.add("bottom");
				} else {
					previousImage.classList.add("bottom");
					images[to - 1].classList.add("top");
				}
			}, TRANSITION);
		},
	},
	computed: {
		scrollTop() {
			return -(window.innerHeight / ITEMS_PER_PAGE) * (this.activeIndex - (ITEMS_PER_PAGE - 1) / 2);
		},
	},
}).mount("#app");
app.init();
