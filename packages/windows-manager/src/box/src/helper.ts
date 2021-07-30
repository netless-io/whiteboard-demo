
export function addListener(node: Window | Element, event: string, fn: any, opt?: boolean | any) {
    node.addEventListener(event, fn, opt || (opt === false) ? opt : true);
}

export function removeListener(node: Window | Element, event: string, fn: any, opt?: boolean) {
    node.removeEventListener(event, fn, opt || (opt === false) ? opt : true);
}

export function preventEvent(event: Event, prevent?: boolean) {
    event.stopPropagation();
    /*prevent &&*/ event.cancelable && event.preventDefault();

    //event.stopImmediatePropagation();
    //event.returnValue = false;
}

export function getByClass(root: Element, name: string) {
    return root.getElementsByClassName(name)[0];
}

export function addClass(node: Element, classname: string) {
    node.classList.add(classname);
}

export function removeClass(node: Element, classname: string) {
    node.classList.remove(classname);
}

export function setStyle(node: any, style: any, value: any) {
    value = "" + value;

    if (node["_s_" + style] !== value) {
        node.style.setProperty(style, value);
        node["_s_" + style] = value;
    }
}

export function setText(node: Element, value: any) {
    if (node.firstChild) {
        node.firstChild.nodeValue = value;
    }
}

export function parse(num: any, base: any, center?: any) {
    if (typeof num === "string") {
        if (num === "center") {
            num = ((base - center) / 2) | 0;
        } else if (num === "right" || num === "bottom") {
            num = (base - center);
        } else {
            const value = parseFloat(num);
            const unit = (("" + value) !== num) && num.substring(("" + value).length);

            if (unit === "%") {
                num = (base / 100 * value) | 0;
            } else {
                num = value;
            }
        }
    }

    return num;
}