import * as React from "react";
import "./index.less";
import {CSSProperties, useEffect, useState} from "react";

export type FlipDownStates = {
    seconds: number,
    stopped: boolean,
    isInit: boolean,
};

export default class FlipCountDown extends React.Component<{}, FlipDownStates> {

    private timerID: number;
    public constructor(props: {}) {
        super(props)
        this.state = {
            seconds: 0,
            stopped: true,
            isInit: true,
        };
    }

   public componentWillUnmount() {
        window.clearInterval(this.timerID);
    }

    private tick = (): void => {
        this.setState({
            seconds: this.state.seconds + 1
        })
    }

    private init = (): void => {
        this.timerID = window.setInterval(() => this.tick(), 1000);
        this.setState({ stopped: false, isInit: false});
    }
    private handleStart = (): void => {
        if (this.state.stopped) {
            this.timerID = window.setInterval(() => this.tick(), 1000);
            this.setState({ stopped: false });
        } else {
            window.clearInterval(this.timerID)
            this.setState({ stopped: true });
        }
    }

    private handleReset = (): void => {
        window.clearInterval(this.timerID);
        this.setState({ seconds: 0, stopped: true, isInit: true });
    }

    private correctValueFormat = (value: number): {left: number, right: number} => {
        return {
            left: Math.floor((value / 10)),
            right: (value % 10),
        };
    }

    private transformTime = (): {
        minutes_left: number,
        minutes_right: number,
        seconds_left: number,
        seconds_right: number,
    } => {
        const current = this.state.seconds;
        const minutes = Math.floor((current % (60 * 60)) / 60)
        const seconds = Math.floor((current % 60))
        const m = this.correctValueFormat(minutes);
        const s = this.correctValueFormat(seconds);
        return {
            minutes_left: m.left,
            minutes_right: m.right,
            seconds_left: s.left,
            seconds_right: s.right,
        }
    }

    render() {
        const { seconds_left, seconds_right, minutes_right, minutes_left} = this.transformTime();
        return (
           <div className="flipdown-box">
               {!this.state.isInit &&
               <div className="flipdown-mask">
                   {this.state.stopped ? <div className="flipdown-mask-mid">
                       <div onClick={this.handleReset} className="flipdown-mask-btn">
                           重置
                       </div>
                       <div onClick={this.handleStart} className="flipdown-mask-btn">
                           继续
                       </div>

                   </div> : <div className="flipdown-mask-mid">
                       <div onClick={this.handleStart} className="flipdown-mask-btn">
                           暂停
                       </div>
                   </div>}
               </div>}
               <div className="flipdown flipdown__theme-dark">
                   <div className="flipdown-mid-box">
                       <TimeCell style={{marginRight: 8}} time={minutes_left}/>
                       <TimeCell time={minutes_right}/>
                   </div>
                   <div className="flipdown-point-box">
                       <div style={{marginBottom: 12}}/>
                       <div/>
                   </div>
                   <div className="flipdown-mid-box">
                       <TimeCell style={{marginRight: 8}} time={seconds_left}/>
                       <TimeCell time={seconds_right}/>
                   </div>
               </div>
               {this.state.isInit &&
                   <div>
                       <div onClick={this.init} className="flipdown-button">
                           开始888
                       </div>
                       <div style={{height: 20}}/>
                   </div>
               }
           </div>
        )
    }
}
type TimeCellProps = {
    time: number;
    style?: CSSProperties;
};

const TimeCell: React.FC<TimeCellProps>  = ({time, style}) => {
    const [flipdown, setFlipdown] = useState("rotor-leaf");
    const [oldTime, setOldTime] = useState(0);
    useEffect(() => {
        setFlipdown(flipdown => "rotor-leaf flipped");
        setTimeout(() =>{
            setFlipdown("rotor-leaf");
            setOldTime(time);
        }, 500)
    }, [time])

    return (
        <div style={style} className="rotor">
            <div className={flipdown}>
                <figure className="rotor-leaf-rear">
                    {time}
                </figure>
                <figure className="rotor-leaf-front">
                    {oldTime}
                </figure>
            </div>
            <div className="rotor-top">
                {time}
            </div>
            <div className="rotor-bottom">
                {oldTime}
            </div>
        </div>
    );
}
