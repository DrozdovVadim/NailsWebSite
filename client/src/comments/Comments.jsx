import { useState, useEffect } from "react";
import axios from "axios";
import style from "./comments.module.css"
import generalStyle from "../App.module.css"
import { useUser } from "../context/UserContext";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import img from "../../public/images/profileImg/4.jpg"






function Comments()
{
    
    const { user, logout } = useUser();
    const [comments, setComments]=useState([])
    const [services, setServices]=useState([])
    const [formRating, setFormRating] = useState("5");
    const [formService, setFormService] = useState("");
    const [formText, setFormText] = useState("");
    const [commentForm, setCommentForm] = useState(false);
    const closeForm = () =>
    {
        setCommentForm(false);
    }
    const showAddCommentForm = () =>
    {
        setCommentForm(!commentForm);
    }

    const getComments = async () => {
        try{
            const res = await axios.get("http://localhost:8000/getComments");
            const commentsData=res.data.map((i) => ({
                id: i.id,
                service: i.service_name,
                raiting: i.raiting,
                user: i.user_name.split(' ')[1] || '',
                text: i.text,
                user_id: i.user_id,
            }))
            setComments(commentsData)
        }
        catch(e)
        {
            console.log(e)
        }
    }
    const getServices = async () =>
    {
        try{
            const res = await axios.get("http://localhost:8000/services")
            setServices(res.data)
        }
        catch (e)
        {
            console.log(e)
        }
    }
    const saveComment = async () => {


        if (!formText || !formService || !formRating) {
            alert("Пожалуйста, заполните все поля.");
            return;
        }

        try {

            const res = await axios.post("http://localhost:8000/saveComment", {
            user_id: user.id,         
            service_id: formService,
            raiting: parseInt(formRating),
            text: formText
            });
            

            if (res.status === 200) {
            alert("Комментарий успешно сохранён!");
            setCommentForm(false);
            setFormText("");
            setFormService("");
            setFormRating("5");
            getComments(); // обновить список комментариев
            }
        } catch (error) {
            console.error("Ошибка при сохранении комментария:", error);
            alert("Ошибка при сохранении комментария.");
        }
        };
    useEffect(()=> {
        getComments()
        getServices()
    },[])

    return (
        <section className={generalStyle.section+ " "+ style.section}>
            <div className={generalStyle.container+" "+style.container}>

                <h2 className={generalStyle.sectionTitle}>Отзывы</h2>

                    <Swiper
                    slidesPerView="auto"
                    spaceBetween={30}
                    breakpoints={{
                        320: {
                        spaceBetween: 20,
                        },
                        640: {
                        spaceBetween: 30,
                        },
                        768: {
                        spaceBetween: 30,
                        },
                        1024: {
                        spaceBetween: 40,
                        },
                        1440: {
                        spaceBetween: 50,
                        },
                    }}
                    className={style.commentsWrapper}
                    >
                    {
                        comments.map(item => {
                            return(
                                <SwiperSlide 
                                
                                className={style.commentItem} id={item.id}>
                                    <img className={style.commentAvatar} src={`/images/profileImg/${item.user_id}.jpg`} alt="avatar" />
                                    <p className={style.autorId}>{item.user}</p>
                                    <p className={style.ServiceId}>{item.service}</p>
                                    <p className={style.raiting}>
                                    {[...Array(item.raiting)].map(i => (
                                        "⭐"
                                    ))}
                                    </p>
                                    <p className={style.commentItemText}>{item.text}</p>
                                </SwiperSlide>
                            )
                        })
                    }
                </Swiper>
                {user &&
                (
                    <div onClick={showAddCommentForm} className={style.addCommentBtn}>
                        Написать комментарий
                    </div>
                ) 
                }
                {
                    commentForm && (
                        <form className={style.commentForm}>
                            <div className={style.closeBtn} onClick={closeForm}>×</div>
                            <h3>Напиши комментарий</h3>
                            <div>
                                <label htmlFor="formRaiting">Поставь оценку</label>
                                <select id="formRaiting" className={style.formRaiting} value={formRating} onChange={(e) => setFormRating(e.target.value)}>
                                {[1, 2, 3, 4, 5].map(num => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
                                </select>
                                </div>

                                <select id="formService" className={style.formService} value={formService} onChange={(e) => setFormService(e.target.value)}>
                                {services.map(service => (
                                    <option key={service.id} value={service.id}>{service.name}</option>
                                ))}
                                </select>

                                <input
                                className={style.formText}
                                type="text"
                                placeholder="Напиши свой комментарий"
                                value={formText}
                                onChange={(e) => setFormText(e.target.value)}
                                />
                                 <input type="button" className={style.formBtn} value={"Оставить отзыв"} onClick={saveComment}/>
                        </form>
                    )
                }

            </div>
        </section>
    )
}
export default Comments;