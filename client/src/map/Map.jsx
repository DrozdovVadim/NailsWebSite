import React from "react";
import style from "./Map.module.css"
import generalStyle from "../App.module.css";



function Map()
{
    return(
        <section id="title5" className={generalStyle.section}>
            <div className={generalStyle.container + " " + style.mapContainer}>
                <h2 className={generalStyle.sectionTitle}>Как до меня добраться</h2>
                <iframe className={style.map} src="https://yandex.ru/map-widget/v1/?um=constructor%3Ac9761ae60f0141ba4ba41a5c58f7421441d8dfb22501510652d86fb18ceb4cc5&amp;source=constructor;&scroll=false" width="100%" height="586" frameborder="0"></iframe>
            </div>
        </section>
    )
}
export default Map;