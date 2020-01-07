import React, { useState } from "react";
import { Button, Icon } from 'antd';

/*export function audioController(audioId) {
    var audioControl = document.getElementById(audioId);
    if(!audioControl) return;

    var isActive = audioControl.getAttribute("active");
    
    !isActive || isActive === "false" ? audioControl.setAttribute("active", true) : audioControl.setAttribute("active", false);
    !isActive || isActive === "false" ? audioControl.play() : audioControl.pause();
}*/

/*
audioId
src
*/
export default function AudioControlButton(props) {
    const [playing, setPlaying] = useState(false);

    const handleClick = (e) => {
        !playing ? setPlaying(true) : setPlaying(false);

        setTimeout(() => audioController(), 100);
    }

    const audioController = () => {
        var audioControl = document.getElementById(props.audioId);
        if(!audioControl) return;

        audioControl.addEventListener("timeupdate", function() {
            if(audioControl.currentTime === audioControl.duration) 
                setPlaying(false)
        });

        !playing ? audioControl.play() : audioControl.pause();
    }

    return (<div className="audio-btn-control">
        <Button disabled={props.disabled} size={props.size} className="audio-btn" shape="circle" onClick={handleClick}>
            <Icon type={!playing?"caret-right":"pause"}/>
        </Button>
        <audio id={props.audioId} controls preload="auto" autobuffer="true" style={{display:"none", visibility:"hidden", width:0, height:0}}>
            <source src={props.src} type="audio/mpeg" />
        </audio>
    </div>);
}