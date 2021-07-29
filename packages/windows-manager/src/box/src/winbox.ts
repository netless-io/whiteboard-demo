import template from "./template";
import { addListener, removeListener, setStyle, setText, getByClass, addClass, removeClass, preventEvent, parse } from "./helper";

//const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window["MSStream"];

const useRaf = false;
//const doc = document.documentElement;
const stackMin: any = [];
let body: any;
let idCounter = 0;
let dblclickTimer = 0;
let index: number;
let isFullscreen: boolean;
let lastFocus: WinBox | null;
let prefixRequest: string;
let prefixExit: string;
let rootW: number, rootH: number;

function setup() {
    body = document.body;

    body[prefixRequest = "requestFullscreen"] ||
    body[prefixRequest = "msRequestFullscreen"] ||
    body[prefixRequest = "webkitRequestFullscreen"] ||
    body[prefixRequest = "mozRequestFullscreen"] ||
    (prefixRequest = "");

    prefixExit = prefixRequest && (
        prefixRequest.replace("request", "exit")
                      .replace("mozRequest", "mozCancel")
                      .replace("Request", "Exit")
    );

    addListener(window, "resize", function () {
        init();
        updateMinStack();
    });

    init();
}

function register(self: any) {
    addWindowListener(self, "title");
    addWindowListener(self, "n");
    addWindowListener(self, "s");
    addWindowListener(self, "w");
    addWindowListener(self, "e");
    addWindowListener(self, "nw");
    addWindowListener(self, "ne");
    addWindowListener(self, "se");
    addWindowListener(self, "sw");

    addListener(getByClass(self.dom, "wb-min"), "click", function(event: MouseEvent) {
        preventEvent(event);
        self.minimize();
    });

    addListener(getByClass(self.dom, "wb-max"), "click", function(event: MouseEvent) {
        preventEvent(event);
        self.focus().maximize();
    });

    // if (prefixRequest) {
    //     addListener(getByClass(self.dom, "wb-full"), "click", function(event: MouseEvent) {
    //         preventEvent(event);
    //         self.focus().fullscreen();
    //     });
    // } else {
    //     self.addClass("no-full");
    // }

    addListener(getByClass(self.dom, "wb-close"), "click", function(event: MouseEvent) {
        preventEvent(event);
        self.close() || (self = null);
    });

    addListener(self.dom, "click", function(event: MouseEvent) {
        // stop propagation would disable global listeners used inside window contents
        // use event bubbling for this listener to skip this handler by the other click listeners
        self.focus();
    }, false);
}

function removeMinStack(self: WinBox) {
    stackMin.splice(stackMin.indexOf(self), 1);
    updateMinStack();
    self.removeClass("min");
    self.min = false;
    self.dom.title = "";
}

function updateMinStack() {
    const len = stackMin.length;
    const tile_index: any = {};
    const tile_len: any = {};

    for (let i = 0, self, key; i < len; i++) {
        self = stackMin[i];
        key = self.left + ":" + self.top;

        if (tile_len[key]) {
            tile_len[key]++;
        } else {
            tile_len[key] = 1;
        }
    }

    for (let i = 0, self, key, width; i < len; i++) {
        self = stackMin[i]
        key = self.left + ":" + self.top;
        width = Math.min((rootW - self.left - self.right) / tile_len[key], 250);
        tile_index[key] || (tile_index[key] = 0);
        self.resize((width + 1) | 0, 35, true)
            .move((self.left + tile_index[key] * width) | 0, rootH - self.bottom - 35, true);
        tile_index[key]++;
    }
}

function addWindowListener(self: WinBox, dir: string) {

    const node = getByClass(self.dom, "wb-" + dir);
    let touch: any[], x: number, y: number;

    addListener(node, "mousedown", mousedown);
    addListener(node, "touchstart", mousedown, { "passive": false });

    let raf: number, raf_move: boolean, raf_resize: boolean;

    function loop() {
        raf = requestAnimationFrame(loop);
        if(raf_resize) {
            self.resize();
            raf_resize = false;
        }
        if(raf_move) {
            self.move();
            raf_move = false;
        }
    }

    function mousedown(event: any) {
        // prevent the full iteration through the fallback chain of a touch event (touch > mouse > click)
        preventEvent(event, true);
        if (self.min) {
            self.minimize();
        } else {
            if (dir === "title") {
                const now = Date.now();
                const diff = now - dblclickTimer;

                dblclickTimer = now;

                if (diff < 250) {
                    self.maximize();
                    return;
                }
            }

            if (!self.max) {
                addClass(body, "wb-drag");
                useRaf && loop();

                if ((touch = event.touches) && (touch = touch[0])) {
                    event = touch;
                    // TODO: fix when touch events bubbles up to the document body
                    //addListener(self.dom, "touchmove", preventEvent);
                    addListener(window, "touchmove", handler_mousemove);
                    addListener(window, "touchend", handler_mouseup);
                } else {
                    //addListener(this, "mouseleave", handler_mouseup);
                    addListener(window, "mousemove", handler_mousemove);
                    addListener(window, "mouseup", handler_mouseup);
                }

                x = event.pageX;
                y = event.pageY;

                // appearing scrollbars on the root element does not trigger "window.onresize",
                // force refresh window size via init(), also force layout recalculation (layout trashing)
                // it is probably very rare that the body overflow changes between window open and close

                //init();
                self.focus();
            }
        }
    }

    function handler_mousemove(srouceEvent: TouchEvent | MouseEvent) {
        preventEvent(srouceEvent);

        let event: Touch | MouseEvent;
        if (touch) {
           event = (srouceEvent as TouchEvent).touches[0];
        } else {
            event = srouceEvent as MouseEvent;
        }

        const pageX = event.pageX;
        const pageY = event.pageY;
        const offsetX = pageX - x;
        const offsetY = pageY - y;

        let resize_w, resize_h, move_x, move_y;

        if (dir === "title") {
            self.x += offsetX;
            self.y += offsetY;
            move_x = move_y = 1;
        } else {
            if (dir === "e" || dir === "se" || dir === "ne") {
                self.width += offsetX;
                resize_w = 1;
            } else if (dir === "w" || dir === "sw" || dir === "nw") {
                self.x += offsetX;
                self.width -= offsetX;
                resize_w = 1;
                move_x = 1;
            }

            if (dir === "s" || dir === "se" || dir === "sw") {

                self.height += offsetY;
                resize_h = 1;
            } else if (dir === "n" || dir === "ne" || dir === "nw") {
                self.y += offsetY;
                self.height -= offsetY;
                resize_h = 1;
                move_y = 1;
            }
        }

        if (resize_w || resize_h) {
            if (resize_w) {
                self.width = Math.max(Math.min(self.width, rootW - self.x - self.right), 150);
            }
            if (resize_h) {
                self.height = Math.max(Math.min(self.height, rootH - self.y - self.bottom), 35);
            }
            useRaf ? raf_resize = true : self.resize();
        }

        if (move_x || move_y) {
            if (move_x) {
                self.x = Math.max(Math.min(self.x, rootW - self.width - self.right), self.left);
            }

            if (move_y) {
                self.y = Math.max(Math.min(self.y, rootH - self.height - self.bottom), self.top);
            }

            useRaf ? raf_move = true : self.move();
        }

        x = pageX;
        y = pageY;
    }

    function handler_mouseup(event: MouseEvent) {
        preventEvent(event);
        removeClass(body, "wb-drag");
        useRaf && cancelAnimationFrame(raf as number);

        if (touch) {
            //removeListener(self.dom, "touchmove", preventEvent);
            removeListener(window, "touchmove", handler_mousemove);
            removeListener(window, "touchend", handler_mouseup);
        } else {
            //removeListener(this, "mouseleave", handler_mouseup);
            removeListener(window, "mousemove", handler_mousemove);
            removeListener(window, "mouseup", handler_mouseup);
        }
    }
}

function init() {
    // TODO: the window height of iOS isn't determined correctly when the bottom toolbar disappears

    // the bounding rect provides more precise dimensions (float values)
    // //const rect = doc.getBoundingClientRect();
    // this.rootW = doc.clientWidth; //rect.width || (rect.right - rect.left);
    // this.rootH = doc.clientHeight; //rect.height || (rect.top - rect.bottom);

    // if(ios){
    //     this.rootH = window.innerHeight * (this.rootW / window.innerWidth);
    // }

    // rootW = doc.clientWidth;
    // rootH = doc.clientHeight;

    rootW = body.clientWidth;
    rootH = body.clientHeight;
}


function has_fullscreen() {
    return (
        document["fullscreen"] ||
        document["fullscreenElement"] ||
        (document as any)["webkitFullscreenElement"] ||
        (document as any)["mozFullScreenElement"]
    );
}

function cancel_fullscreen(self: WinBox): boolean | undefined {
    isFullscreen = false;

    if (has_fullscreen()) {
        // exitFullscreen is executed as async and returns promise.
        // the important part is that the promise callback runs before the event "onresize" was fired!

        (document as any)[prefixExit]();
        return true;
    } else {
        return undefined;
    }
}

export type WinBoxConfig = {
    id?: string;
    root?: any;
    title?: string;
    width?: number;
    mount?: any;
    modal?: boolean;
    html?: string;
    url?: string;
    height?: number;
    minwidth?: number;
    minheight?: number;
    x?: number;
    y?: number;
    max?: number;
    top?: number;
    left?: number;
    bottom?: number;
    right?: number;
    index?: number;
    onclose?: () => void;
    onfocus?: () => void;
    onblur?: () => void;
    onmove?: () => void;
    onresize?: () => void;
    background?: string;
    border?: number;
    class?: string;
    splitscreen?: boolean;
}

export class WinBox {
    public body: HTMLDivElement;
    public dom: any;
    public title: string = "";
    public onfocus: any;
    public onresize: any;
    public onmove: any;
    public onclose: any;
    public onblur: any;
    public min: any;
    public max: any;
    public width: number;
    public height: number;
    public left: number;
    public right: number;
    public top: number;
    public bottom: number;
    public minwidth: number;
    public minheight: number;
    public x: number;
    public y: number;
    public splitscreen: boolean = false;
    public modal: any;
    public id: any;
    public root: any;
    public html: string = "";
    public background: string = "";
    public border: number = 0;
    public classname: string = "";

    constructor(_title: string, params: WinBoxConfig) {
        index || setup();

        this.dom = template();
        this.body = getByClass(this.dom, "wb-body") as HTMLDivElement;

        let id, root, title, mount, html, url, width, height, minwidth, minheight, x, y, max, top, left, bottom, right,
        modal, onclose, onfocus, onblur, onmove, onresize, background, border, classname, splitscreen;

        if (params) {
            if (typeof params === "string") {
                title = params;
            } else {
                if ((modal = params["modal"])) {
                    x = y = "center";
                }

                id = params["id"];
                root = params["root"];
                title = title || params["title"];
                mount = params["mount"];
                html = params["html"];
                url = params["url"];
                width = params["width"];
                height = params["height"];
                minwidth = params["minwidth"];
                minheight = params["minheight"];
                x = params["x"] || x;
                y = params["y"] || y;
                max = params["max"];
                top = params["top"];
                left = params["left"];
                bottom = params["bottom"];
                right = params["right"];
                index = params["index"] || index;
                onclose = params["onclose"];
                onfocus = params["onfocus"];
                onblur = params["onblur"];
                onmove = params["onmove"];
                onresize = params["onresize"];
                background = params["background"];
                border = params["border"];
                classname = params["class"];
                splitscreen = params["splitscreen"];

                if (background) {
                    this.setBackground(background);
                }

                if (this.border) {
                    setStyle(this.body, "margin", this.border + (isNaN(this.border) ? "" : "px"));
                }
            }
        }

        this.setTitle(title || "");

        let max_width = rootW;
        let max_height = rootH;

        top = top ? parse(top, max_height) : 0;
        bottom = bottom ? parse(bottom, max_height) : 0;
        left = left ? parse(left, max_width) : 0;
        right = right ? parse(right, max_width) : 0;

        max_width -= left + right;
        max_height -= top + bottom;

        width = width ? parse(width, max_width) : (max_width / 2) | 0;
        height = height ? parse(height, max_height) : (max_height / 2) | 0;

        minwidth = minwidth ? parse(minwidth, max_width) : 0;
        minheight = minheight ? parse(minheight, max_height) : 0;

        x = x ? parse(x, max_width, width) : left;
        y = y ? parse(y, max_height, height) : top;

        index = index || 10;

        this.dom.id =
        this.id = id || ("winbox-" + (++idCounter));
        this.dom.className = "winbox" + (classname ? " " + (typeof classname === "string" ? classname : (classname as any).join(" ")) : "") +
                                        (modal ? " modal" : "");
        console.log("clssName", this.dom.className, classname);
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.minwidth = minwidth;
        this.minheight = minheight;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;

        if (border) {
            this.border = border;
        }
        this.min = false;
        this.max = false;

        this.onclose = onclose;
        this.onfocus = onfocus;
        this.onblur = onblur;
        this.onmove = onmove;
        this.onresize = onresize;
        if (splitscreen) {
            this.splitscreen = splitscreen;
        }

        if (max) {
            this.maximize();
        } else{
            this.move().resize();
        }

        this.focus();

        if (mount) {
            this.mount(mount);
        } else if (html) {
            this.body.innerHTML = html;
        } else if (url) {
            this.setUrl(url);
        }

        register(this);
        (root || body).appendChild(this.dom);
    }

    mount(src: any): WinBox {
         // handles mounting over:
        this.unmount();

        src._backstore || (src._backstore = src.parentNode);
        this.body.textContent = "";
        this.body.appendChild(src);

        return this;
    }

    unmount(dest?: any): WinBox {
        const node = this.body.firstChild as any;
        if (node) {
            const root = dest || node._backstore;
            root && root.appendChild(node);
            node._backstore = dest;
        }
        return this;
    }

    setTitle(title: string): WinBox {
        setText(getByClass(this.dom, "wb-title"), this.title = title);
        return this;
    }

    setBackground(background: any): WinBox {
        setStyle(this.dom, "background", background);
        return this;
    }

    setUrl(url: string): WinBox {
        this.body.innerHTML = '<iframe src="' + url + '"></iframe>';
        return this;
    }

    focus() {
        if(lastFocus !== this){
            setStyle(this.dom, "z-index", index++);
            this.addClass("focus");
            if(lastFocus){
                lastFocus.removeClass("focus");
                lastFocus.onblur && lastFocus.onblur();
            }
            lastFocus = this;
            this.onfocus && this.onfocus();
        }
        return this;
    }

    hide() {
        return this.addClass("hide");
    }

    show() {
        return this.removeClass("hide");
    }

    minimize(state?: any): WinBox {
        if(isFullscreen){
            cancel_fullscreen(this);
        }
        if(!state && this.min){
            removeMinStack(this);
            this.resize().move().focus();
        }
        else if((state !== false) && !this.min){
            stackMin.push(this);
            updateMinStack();
            this.dom.title = this.title;
            this.addClass("min");
            this.min = true;
        }

        if(this.max){
            this.removeClass("max");
            this.max = false;
        }

        return this;
    }

    maximize(state?: any): WinBox {
        if (typeof state === "undefined" || (state !== this.max)) {
            if (this.min) {
                removeMinStack(this);
            }

            if ((this.max = !this.max)) {
                this.addClass("max").resize(
                    rootW - this.left - this.right,
                    rootH - this.top - this.bottom /* - 1 */,
                    true
                ).move(
                    this.left,
                    this.top,
                    true
                );
            } else {
                this.resize().move().removeClass("max");
            }
        }

        return this;
    }

    resize(w?: number, h?: number, _skipUpdate?: boolean): WinBox {
        if(!w && (w !== 0)){
            w = this.width;
            h = this.height;
        }
        else if(!_skipUpdate){
            this.width = w ? w = parse(w, rootW - this.left - this.right) : 0;
            this.height = h ? h = parse(h, rootH - this.top - this.bottom) : 0;
        }

        if (w && h) {
            w = Math.max(w, this.minwidth);
            h = Math.max(h, this.minheight);
        }

        setStyle(this.dom, "width", w + "px");
        setStyle(this.dom, "height", h + "px");

        this.onresize && this.onresize(w, h);
        return this;
    }

    move(x?: number | string, y?: number | string, _skipUpdate?: boolean): WinBox {
        if(!x && (x !== 0)){
            x = this.x;
            y = this.y;
            if( this.splitscreen ){
                if( x === 0 ){
                    this.resize(rootW / 2, rootH);
                } else if( x === (rootW - this.width) ){
                    this.resize(rootW / 2, rootH);
                }
            }
        }
        else if(!_skipUpdate){
            this.x = x ? x = parse(x, rootW - this.left - this.right, this.width) : 0;
            this.y = y ? y = parse(y, rootH - this.top - this.bottom, this.height) : 0;
        }

        setStyle(this.dom, "transform", "translate(" + x + "px," + y + "px)");
        this.onmove && this.onmove(x, y);
        return this;
    }

    // TODO

    close(force?: any): any {
        if(this.onclose && this.onclose(force)){
            return true;
        }
        if(this.min){
            removeMinStack(this);
        }
        this.unmount();
        this.dom.parentNode.removeChild(this.dom);
        if(lastFocus === this){
            lastFocus = null;
        }
    }

    fullscreen(state?: any): WinBox {
        if (typeof state === "undefined" || (state !== isFullscreen)) {
            if (this.min) {
                this.resize().move();
                removeMinStack(this);
            }
            // fullscreen could be changed by user manually!

            if (!isFullscreen || !cancel_fullscreen(this)) {

                // requestFullscreen is executed as async and returns promise.
                // in this case it is better to set the state to "this.full" after the requestFullscreen was fired,
                // because it may break when browser does not support fullscreen properly and bypass it silently.

                //this.dom[prefixRequest]();
                (this.body as any)[prefixRequest]();
                isFullscreen = true;
            }

            // dispatch resize callback on fullscreen?

            // else{
            //
            //     this.onresize && this.onresize(this.width, this.height);
            // }
        }

        return this;
    }

    addClass(classname: string): WinBox {
        addClass(this.dom, classname);
        return this;
    }

    removeClass(classname: string): WinBox {
        removeClass(this.dom, classname);
        return this;
    }
}
