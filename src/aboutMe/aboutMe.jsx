import React from "react";
import style from "./aboutMe.module.css";
import generalStyle from "../App.module.css";
import aboutMeImg from "../images/aboutMeImg.jpg"

function AboutMe()
{
    return(
        <div className={generalStyle.section+ " "+ style.aboutMeSection}>
            <div className={generalStyle.container+ " "+style.aboutMeContainer}>
                <h2 className={generalStyle.sectionTitle}>Пару слов о себе</h2>
                <div className={style.aboutMeContent}>
                    <p className={style.aboutMeText}>
                        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Fuga eligendi dignissimos itaque laudantium exercitationem corrupti hic iste, dolor, modi corporis sint ea eum libero suscipit quibusdam nam eaque soluta facere. Lorem ipsum, dolor sit amet consectetur adipisicing elit. Fuga eligendi dignissimos itaque laudantium exercitationem corrupti hic iste, dolor, modi corporis sint ea eum libero suscipit quibusdam nam eaque soluta facere.
                    </p>
                    <img className={style.aboutMeImg} src={aboutMeImg} alt="photo" />
                </div>
            </div>
        </div>
    );
    
}
export default AboutMe;