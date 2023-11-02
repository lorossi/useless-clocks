class Description {
  constructor(size = 300) {
    this._size = size;
    this._visible = false;
    this._white = this._loadCSSVar("white");
    this._black = this._loadCSSVar("black");
    this._button_border = 50;

    // create the div element and append it to the body
    this._div = this._createDiv();
    this._description_p = this._div.querySelector("#content");
    this._title_p = this._div.querySelector("#title");
    this._exit_button = this._div.querySelector("#close-button");
    this._exit_button.addEventListener("click", (_) => {
      this.hide();
    });

    window.addEventListener("resize", () => {
      this._positionDiv(this._div);
    });
    document.querySelector("body").appendChild(this._div);
    // initialize description and title
    this._description = "";
    this._title = "";

    // select the container of the description
    this._container = document.querySelector(".container");
  }

  _getPageWidth() {
    return Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.documentElement.clientWidth
    );
  }

  _getPageHeight() {
    return Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.documentElement.clientHeight
    );
  }

  _loadCSSVar(name) {
    const var_name = `--${name}`;
    const body = document.querySelector("body");
    return getComputedStyle(body).getPropertyValue(var_name);
  }

  _createDiv() {
    const div = document.createElement("div");
    div.style.width = `${this._size}px`;
    div.id = "description-container";
    div.classList.add("hidden");

    const title = document.createElement("h1");
    title.style.color = this._white;
    title.style.textAlign = "center";
    title.textContent = this._title;
    title.id = "title";
    div.appendChild(title);

    const description = document.createElement("p");
    description.style.color = this._white;
    description.style.textAlign = "center";
    description.textContent = this._description;
    description.id = "content";
    div.appendChild(description);

    const button = document.createElement("span");
    button.id = "close-button";
    button.textContent = "ok, got that";
    div.appendChild(button);

    this._positionDiv(div);

    return div;
  }

  _positionDiv(div) {
    const div_w = div.offsetWidth;
    const div_h = div.offsetHeight;
    const page_w = this._getPageWidth();
    const page_h = this._getPageHeight();

    div.style.left = `${(page_w - div_w) / 2}px`;
    div.style.top = `${(page_h - div_h) / 2}px`;
  }

  setTitle(title) {
    this._title = title;
    this._title_p.textContent = this._title;
  }

  setDescription(description) {
    this._description = description;
    this._description_p.textContent = this._description;
    this._positionDiv(this._div);
  }

  show() {
    if (this._visible) return;
    this._container.classList.add("faded");
    this._div.classList.remove("hidden");
    this._positionDiv(this._div);

    this._visible = true;
  }

  hide() {
    if (!this._visible) return;
    this._container.classList.remove("faded");
    this._div.classList.add("hidden");

    this._visible = false;
  }

  get visible() {
    return this._visible;
  }
}

export { Description };
