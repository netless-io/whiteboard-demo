import * as React from "react";

export type IconProps = {
    color?: string;
    className?: string;
};

export class ToolBoxSelector extends React.Component<IconProps, {}> {

    public constructor(props: IconProps) {
        super(props);
    }

    public render(): React.ReactNode {
        const isActive = this.props.color !== "rgb(162,167,173)";
        return (
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd"
                      d="M2.4868 6.58275C1.62719 6.24058 1.65327 5.01496 2.52665 4.70966L14.0769 0.672222C14.8612 0.398074 15.6184 1.14442 15.3555 1.93256L11.5076 13.4712C11.2154 14.3477 9.99264 14.3929 9.63635 13.5405L7.73683 8.99596C7.63313 8.74785 7.43386 8.55196 7.18402 8.45251L2.4868 6.58275Z"
                      transform="translate(16) scale(-1 1)"
                      fill={isActive ? "#141414" : this.props.color}
                />
            </svg>

        );
    }
}

export class ToolBoxPencil extends React.Component<IconProps, {}> {

    public constructor(props: IconProps) {
        super(props);
    }

    public render(): React.ReactNode {
        return (
            <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M0.0182346 1.54448C0.83115 1.03978 11.0803 -1.33972 12.0561 1.03978C13.0318 3.41928 0.61548 2.16248 0.0182346 5.45443C-0.579009 8.74638 13.7165 2.52969 12.8863 6.04973C12.0561 9.56977 0.0182346 7.06741 0.0182346 10.8533C0.0182346 14.6391 11.9891 8.31318 12.8863 10.5679C13.7834 12.8226 8.20001 13.3065 5.7957 14.0422"
                    transform="translate(1 1.90564) rotate(-4)"
                    stroke={this.props.color} strokeWidth="2" strokeLinecap="round"
                    strokeLinejoin="round"/>
            </svg>
        );
    }
}

export class ToolBoxText extends React.Component<IconProps, {}> {

    public constructor(props: IconProps) {
        super(props);
    }

    public render(): React.ReactNode {
        return (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 2V0H12V2" transform="translate(1 1)" stroke={this.props.color} strokeWidth="1.86667"
                      strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M0 0H7" transform="translate(3.5 12.5)" stroke={this.props.color} strokeWidth="1.86667"
                      strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M0 0V11" transform="translate(7 1)" stroke={this.props.color} strokeWidth="1.86667"
                      strokeLinecap="round" strokeLinejoin="round"/>
            </svg>

        );
    }
}

export class ToolBoxEraser extends React.Component<IconProps, {}> {

    public constructor(props: IconProps) {
        super(props);
    }

    public render(): React.ReactNode {
        const isActive = this.props.color !== "rgb(162,167,173)";
        return (
            <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10.968 1.41667C10.1704 0.637358 8.88965 0.660726 8.1211 1.46861L0.651229 9.32083C0.285744 9.70502 0.283692 10.3077 0.646551 10.6944L3.352 13.5774C3.54103 13.7788 3.80496 13.8931 4.0812 13.8931H5.86992C6.14522 13.8931 6.40834 13.7796 6.59727 13.5793L13.316 6.45851C14.0646 5.66504 14.0393 4.41798 13.2591 3.65553L10.968 1.41667Z"
                    transform="translate(1 0.711777)"
                    stroke={isActive ? "#141414" : this.props.color} strokeLinecap="round" strokeLinejoin="round"/>
                <path fillRule="evenodd" clipRule="evenodd"
                      d="M4.90193 2.35191C6.03948 1.07145 8.0164 1.00167 9.24141 2.19873L10.7139 3.63766C11.8959 4.79261 11.9212 6.68589 10.7706 7.87207L5.56447 13.2393L-7.02753e-08 7.86966L4.90193 2.35191Z"
                      transform="translate(3.51389)"
                      fill={isActive ? "#141414" : this.props.color}/>
            </svg>

        );
    }
}

export class ToolBoxUpload extends React.Component<IconProps, {}> {

    public constructor(props: IconProps) {
        super(props);
    }

    public render(): React.ReactNode {
        return (
            <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0 13.4766C0 14.3174 0.651367 15 1.45459 15H14.5454C15.3486 15 16 14.3174 16 13.4766V3.04785C16 2.49512 15.5522 2.04785 15 2.04785H8.39575C8.1416 2.04785 7.89673 1.95117 7.71143 1.77637L6.10669 0.270508C5.92139 0.0966797 5.67676 0 5.42236 0H1C0.447754 0 0 0.447266 0 1V13.4766ZM8.69995 5.33301C8.69995 4.94629 8.38672 4.63281 8 4.63281C7.61353 4.63281 7.30005 4.94629 7.30005 5.33301V11.3994C7.30005 11.7861 7.61353 12.0996 8 12.0996C8.38672 12.0996 8.69995 11.7861 8.69995 11.3994V5.33301Z"
                    fill={this.props.color}/>
                <path
                    d="M0 2.83111L2.625 0L5.25 2.83111"
                    transform="translate(5.37524 5.33301)"
                    fill="white"/>
                <path
                    d="M0 2.83111L2.625 0L5.25 2.83111H0Z"
                    transform="translate(5.37524 5.33301)"
                    stroke="white"
                    strokeWidth="1.4"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"/>
            </svg>
        );
    }
}


export class ToolBoxEllipse extends React.Component<IconProps, {}> {

    public constructor(props: IconProps) {
        super(props);
    }

    public render(): React.ReactNode {
        return (
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M7.5 15C11.6421 15 15 11.6421 15 7.5C15 3.35786 11.6421 0 7.5 0C3.35786 0 0 3.35786 0 7.5C0 11.6421 3.35786 15 7.5 15Z"
                    transform="translate(1 1)"
                    stroke={this.props.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"/>
            </svg>
        );
    }
}

export class ToolBoxRectangle extends React.Component<IconProps, {}> {

    public constructor(props: IconProps) {
        super(props);
    }

    public render(): React.ReactNode {
        return (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 0H0V14H14V0Z" transform="translate(1 1)"
                      stroke={this.props.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>

        );
    }
}

export class ToolBoxArrow extends React.Component<IconProps, {}> {

    public constructor(props: IconProps) {
        super(props);
    }

    public render(): React.ReactNode {
        return (
            <svg width="16px" height="16px" viewBox="0 0 18 17" xmlns="http://www.w3.org/2000/svg">
                <g id="页面1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                    <path d="M12.6143736,0.348098944 C12.2238736,-0.0424250563 11.5906736,-0.0424260563 11.2001736,0.348097944 L11.0951736,0.453048944 C10.7049736,0.843321944 10.7046736,1.47600194 11.0945736,1.86663194 L15.5507736,6.33078194 C15.8646736,6.64529194 15.6430736,7.18245194 15.1986736,7.18402194 L-1.18463142,7.24162194 C-1.73554042,7.24356194 -2.1811148,7.69070194 -2.1811148,8.24161194 L-2.1811148,8.39555194 C-2.1811148,8.94921194 -1.73125342,9.39749194 -1.17759642,9.39554194 L15.1866736,9.33800194 C15.6327736,9.33643194 15.8574736,9.87549194 15.5422736,10.1911919 L11.0945736,14.6468919 C10.7046736,15.0374919 10.7049736,15.6701919 11.0951736,16.0604919 L11.2001736,16.1654919 C11.5906736,16.5559919 12.2238736,16.5559919 12.6143736,16.1654919 L19.8159736,8.96388194 C20.2064736,8.57335194 20.2064736,7.94019194 19.8159736,7.54966194 L12.6143736,0.348098944 Z"
                          id="路径" fill={this.props.color} fillRule="nonzero" transform="translate(8.963867, 8.256786) rotate(-45.000000) translate(-8.963867, -8.256786) "/>
                </g>
            </svg>

        );
    }
}

export class ToolBoxLaserPointer extends React.Component<IconProps, {}> {

    public constructor(props: IconProps) {
        super(props);
    }

    public render(): React.ReactNode {
        const isActive = this.props.color !== "rgb(162,167,173)";
        return (
            <svg width="22px" height="22px" viewBox="0 0 22 22" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <title>bfbd6b2e16d3777ec4df3746d073e284_svg</title>
                <desc>Created with Sketch.</desc>
                <g id="页面1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                    <g id="bfbd6b2e16d3777ec4df3746d073e284_svg" fill={isActive ? "#141414" : this.props.color} fillRule="nonzero">
                        <polygon id="矩形" transform="translate(11.328548, 10.651199) rotate(-45.000000) translate(-11.328548, -10.651199) " points="10.6840017 10.0066523 11.9718384 10.0079087 11.9730948 11.2957454 10.6852581 11.2944889"/>
                        <path d="M19.4217853,2.5782015 L19.4217853,0 L18.1326779,0 L18.1326779,2.5782015 L15.5544202,2.5782015 L15.5544202,3.86730224 L17.2211375,3.86730224 L13.1515613,7.93685765 L11.3284375,6.11374324 L0.565480321,16.8767741 C-0.18849344,17.630744 -0.18849344,18.8574544 0.565480321,19.6114243 L2.38856112,21.4345387 C3.14249191,22.1884656 4.36925152,22.1885086 5.12322528,21.4345387 L5.62475726,20.9330093 C6.87218487,21.7577914 8.57753112,21.6257919 9.68092727,20.5224873 L11.6000004,18.603553 L10.68846,17.6919743 L8.76938687,19.6109516 C8.17517116,20.2051643 7.28756439,20.3309334 6.56895396,19.9888604 L15.8862254,10.6715078 L14.0631017,8.84843635 L18.1326779,4.77888094 L18.1326779,6.44558968 L19.4217853,6.44558968 L19.4217853,3.86734521 L22,3.86734521 L22,2.5782015 L19.4217853,2.5782015 Z M4.21159894,20.522917 C3.96031732,20.7741974 3.55138313,20.7742403 3.30001558,20.522917 L1.47693478,18.6998456 C1.22561019,18.4485653 1.22561019,18.0395902 1.47693478,17.7883099 L1.93257607,17.3326709 L4.66719727,20.067321 L4.21159894,20.522917 Z M5.5788236,19.1557423 L2.84420241,16.4210922 L6.44859831,12.8167148 L9.18326248,15.5513649 L5.5788236,19.1557423 Z M14.0631446,10.6714648 L10.0947599,14.6398292 L7.36009574,11.9051791 L11.3284375,7.93685765 L14.0631446,10.6714648 Z" id="形状"/>
                    </g>
                </g>
            </svg>
        );
    }
}

export class ToolBoxHand extends React.Component<IconProps, {}> {

    public constructor(props: IconProps) {
        super(props);
    }

    public render(): React.ReactNode {
        const isActive = this.props.color !== "rgb(162,167,173)";
        return (
            <svg width="18px" height="18px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <title>路径</title>
                <desc>Created with Sketch.</desc>
                <g id="页面1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                    <path d="M19.6865797,9.24230756 L16.743057,6.29881363 C16.4640395,6.01979889 16.0120312,6.01979889 15.7330138,6.29881363 C15.4539963,6.57782837 15.4539963,7.02983226 15.7330138,7.308847 L17.7097967,9.28561065 L10.7142708,9.28561065 L10.7142708,2.29015301 L12.6910537,4.26691666 C12.8305625,4.40642404 13.0133747,4.47628933 13.1959637,4.47628933 C13.3785528,4.47628933 13.5615882,4.40664725 13.7008737,4.26691666 C13.9798912,3.98790192 13.9798912,3.53589804 13.7008737,3.25688329 L10.7575743,0.313389359 C10.3403874,-0.10446312 9.65958474,-0.10446312 9.24239782,0.313389359 L6.29887514,3.25688329 C6.01985767,3.53589804 6.01985767,3.98790192 6.29887514,4.26691666 C6.57789261,4.54593141 7.0299009,4.54593141 7.30891837,4.26691666 L9.28570133,2.29015301 L9.28570133,9.28561065 L2.29017538,9.28561065 L4.26695833,7.308847 C4.5459758,7.02983226 4.5459758,6.57782837 4.26695833,6.29881363 C3.98794086,6.01979889 3.53593257,6.01979889 3.2569151,6.29881363 L0.31339242,9.24230756 C-0.10446414,9.65949041 -0.10446414,10.3402864 0.31339242,10.7574692 L3.25713831,13.7011864 C3.53615578,13.9802011 3.98816408,13.9802011 4.26718155,13.7011864 C4.40669028,13.561679 4.47655625,13.3788685 4.47655625,13.1962813 C4.47655625,13.013694 4.40691349,12.8306604 4.26718155,12.6913762 L2.29017538,10.7141661 L9.28570133,10.7141661 L9.28570133,17.7096238 L7.30891837,15.7328601 C7.0299009,15.4538454 6.57789261,15.4538454 6.29887514,15.7328601 C6.01985767,16.0118749 6.01985767,16.4638788 6.29887514,16.7428935 L9.24262103,19.6866106 C9.65980795,20.1044631 10.3406106,20.1044631 10.7577975,19.6866106 L13.7015434,16.7428935 C13.9805608,16.4638788 13.9805608,16.0118749 13.7015434,15.7328601 C13.5620346,15.5933528 13.3792224,15.5234875 13.1966334,15.5234875 C13.0140443,15.5234875 12.8310089,15.5931295 12.6917234,15.7328601 L10.7142708,17.7096238 L10.7142708,10.7141661 L17.7097967,10.7141661 L15.7330138,12.6909298 C15.593505,12.8304372 15.5236391,13.0132476 15.5236391,13.1958349 C15.5236391,13.3784221 15.5932818,13.5614558 15.7330138,13.7007399 C16.0120312,13.9797547 16.4640395,13.9797547 16.743057,13.7007399 L19.6868029,10.7570228 C20.1044362,10.3402864 20.1044362,9.65949041 19.6865797,9.24230756 Z" id="路径" fill={isActive ? "#141414" : this.props.color} fillRule="nonzero"/>
                </g>
            </svg>
        );
    }
}

export class ToolBoxStraight extends React.Component<IconProps, {}> {

    public constructor(props: IconProps) {
        super(props);
    }

    public render(): React.ReactNode {
        return (
            <svg width="16px" height="16px" viewBox="0 0 14 14" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <g id="页面1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" strokeLinecap="round">
                    <path d="M1,1 L12.3137085,12.3137085" id="路径-2" stroke={this.props.color} strokeWidth="2"/>
                </g>
            </svg>

        );
    }
}

export class StrokeWidth extends React.Component<IconProps, {}> {

    public constructor(props: IconProps) {
        super(props);
    }

    public render(): React.ReactNode {
        return (
            <div className={this.props.className}>
                <svg width="242" height="32" viewBox="0 0 269 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M252 31.9693V32L0 16V15L252 0V0.030742C252.331 0.0103478 252.664 0 253 0C261.837 0 269 7.16344 269 16C269 24.8366 261.837 32 253 32C252.664 32 252.331 31.9897 252 31.9693Z"
                        fill={this.props.color}/>
                </svg>
            </div>
        );
    }
}
