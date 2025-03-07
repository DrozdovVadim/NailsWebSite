import React from "react";
import style from "./aboutMe.module.css";
import generalStyle from "../App.module.css";

function AboutMe()
{
    return(
        <div className={generalStyle.section+ " "+ style.aboutMeSection}>
            <div className={generalStyle.container+ " "+style.aboutMeContainer}>
                <h2 className={generalStyle.sectionTitle}>Пару слов о себе</h2>

            </div>
        </div>
    );
    
}
export default AboutMe;