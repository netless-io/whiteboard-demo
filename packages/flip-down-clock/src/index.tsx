import * as React from "react";
import "./index.less";

enum Theme {
    dark = "dark",
    light = "light",
}
export type OptionType = {
    theme: Theme,
    headings: string[],
};

export type ClockValueObj = {
    m: number,
    s: number,
}

export type ClockStringObj = {
    m: string,
    s: string,
}

// export type FlipDownProps = {
//     uts: number,
//     el: HTMLElement,
//     opt: OptionType,
// };

export default class FlipDown extends React.Component<{}, {}> {
    public version = "0.0.1";
    public initialised: boolean;
    public now: number = FlipDown.getCurrentTime();
    public epoch: number;
    public countdownEnded: boolean;
    public hasEndedCallback: (() => void) | null;
    public element: HTMLElement
    public rotors: HTMLElement[];
    public rotorLeafFront: HTMLElement[];
    public rotorLeafRear: HTMLElement[];
    public rotorTop: HTMLElement[];
    public rotorBottom: HTMLElement[];
    public opts: OptionType;

    // Interval
    public countdown: number;

    // Number of days remaining
    public daysRemaining: number = 0;

    // Clock values as numbers
    public clockValues: ClockValueObj;

    // Clock values as strings
    public clockStrings: ClockStringObj;

    // Clock values as array
    public clockValuesAsString: string[];
    public prevClockValuesAsString: string[];

    public constructor(props: {}) {
        super(props)
        this.initialised = false;
        // UTS to count down to
        const twoDaysFromNow = (new Date().getTime() / 1000) + (86400 * 2) + 1;
        this.epoch = twoDaysFromNow;

        // UTS passed to FlipDown is in the past
        this.countdownEnded = false;

        // User defined callback for countdown end
        this.hasEndedCallback = null;

    }

    public start = () => {
        // Initialise the clock
        if (!this.initialised) this.init();

        // Set up the countdown interval
        this.countdown = window.setInterval(this.tick, 1000);
        return this;
    }

    public ifEnded = (cb: any) => {
        this.hasEndedCallback = () => {
            cb();
            this.hasEndedCallback = null;
        };
        return this;
    }

    private static getCurrentTime(): number {
        return new Date().getTime() / 1000;
    }

    private hasCountdownEnded = (): boolean => {
        // Countdown has ended
        if (this.epoch - this.now < 0) {
            this.countdownEnded = true;

            // Fire the ifEnded callback once if it was set
            if (this.hasEndedCallback != null) {
                // Call ifEnded callback
                this.hasEndedCallback();

                // Remove the callback
                this.hasEndedCallback = null;
            }

            return true;

            // Countdown has not ended
        } else {
            this.countdownEnded = false;
            return false;
        }
    }

     private parseOptions = (opt: OptionType): OptionType => {
        let headings = ["Days", "Hours", "Minutes", "Seconds"];
        if (opt.headings && opt.headings.length === 4) {
            headings = opt.headings;
        }
        return {
            theme: opt.theme ? opt.theme : Theme.dark,
            headings,
        };
    }

    private init = () =>  {

        this.rotorLeafFront = Array.prototype.slice.call(
            this.element.getElementsByClassName("rotor-leaf-front")
        );
        this.rotorLeafRear = Array.prototype.slice.call(
            this.element.getElementsByClassName("rotor-leaf-rear")
        );
        this.rotorTop = Array.prototype.slice.call(
            this.element.getElementsByClassName("rotor-top")
        );
        this.rotorBottom = Array.prototype.slice.call(
            this.element.getElementsByClassName("rotor-bottom")
        );

        this.tick();
        this.updateClockValues(true);

        return this;
    }

    private pad = (n: number, len: number): string => {
        return n.toString().padStart(len, "0");
    }


    private tick() {
        // Get time now
        this.now = FlipDown.getCurrentTime();

        // Between now and epoch
        let diff = this.epoch - this.now <= 0 ? 0 : this.epoch - this.now;


        // Minutes remaining
        this.clockValues.m = Math.floor(diff / 60);
        diff -= this.clockValues.m * 60;

        // Seconds remaining
        this.clockValues.s = Math.floor(diff);

        // Update clock values
        this.updateClockValues(false);

        // Has the countdown ended?
        this.hasCountdownEnded();
    }

    private rotorLeafRearFlip = () => {
        this.rotorLeafRear.forEach((el:HTMLElement, i: number) => {
            if (el.textContent !== this.clockValuesAsString[i]) {
                el.textContent = this.clockValuesAsString[i];
                el.parentElement && el.parentElement.classList.add("flipped");
                let flip = window.setInterval(
                    () => {
                        el.parentElement && el.parentElement.classList.remove("flipped");
                        clearInterval(flip);
                    },
                    500
                );
            }
        });
    }

    private rotorTopFlip = () => {
        this.rotorTop.forEach((el: HTMLElement, i: number) => {
            if (el.textContent !== this.clockValuesAsString[i]) {
                el.textContent = this.clockValuesAsString[i];
            }
        });
    }

    private updateClockValues = (init: boolean) => {
        // Build clock value strings
        this.clockStrings.m = this.pad(this.clockValues.m, 2);
        this.clockStrings.s = this.pad(this.clockValues.s, 2);

        // Concat clock value strings
        this.clockValuesAsString = (
            this.clockStrings.m +
            this.clockStrings.s
        ).split("");

        this.rotorLeafFront.forEach((el: HTMLElement, i:  number) => {
            el.textContent = this.prevClockValuesAsString[i];
        });

        this.rotorBottom.forEach((el: HTMLElement, i: number) => {
            el.textContent = this.prevClockValuesAsString[i];
        });

        this.rotorTopFlip();
        this.rotorLeafRearFlip();

        // Init
        if (!init) {
            setTimeout(this.rotorTopFlip, 500);
            setTimeout(this.rotorLeafRearFlip, 500);
        } else {
            this.rotorTopFlip.call(this);
            this.rotorLeafRearFlip.call(this);
        }

        // Save a copy of clock values for next tick
        this.prevClockValuesAsString = this.clockValuesAsString;
    }

    public render() {
        return (
            <div id="flipdown">
                <div className="rotor-group">
                    <div className="rotor">
                        <div className="rotor-leaf">
                            <figure className="rotor-leaf-rear">
                                0
                            </figure>
                            <figure className="rotor-leaf-front">
                                0
                            </figure>
                        </div>
                        <div className="rotor-top">
                            0
                        </div>
                        <div className="rotor-bottom">
                            0
                        </div>
                    </div>
                    <div className="rotor">
                        <div className="rotor-leaf">
                            <figure className="rotor-leaf-rear">
                                0
                            </figure>
                            <figure className="rotor-leaf-front">
                                0
                            </figure>
                        </div>
                        <div className="rotor-top">
                            0
                        </div>
                        <div className="rotor-bottom">
                            0
                        </div>
                    </div>
                </div>
                <div className="rotor-group">
                    <div className="rotor">
                        <div className="rotor-leaf">
                            <figure className="rotor-leaf-rear">
                                0
                            </figure>
                            <figure className="rotor-leaf-front">
                                0
                            </figure>
                        </div>
                        <div className="rotor-top">
                            0
                        </div>
                        <div className="rotor-bottom">
                            0
                        </div>
                    </div>
                    <div className="rotor">
                        <div className="rotor-leaf">
                            <figure className="rotor-leaf-rear">
                                0
                            </figure>
                            <figure className="rotor-leaf-front">
                                0
                            </figure>
                        </div>
                        <div className="rotor-top">
                            0
                        </div>
                        <div className="rotor-bottom">
                            0
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
