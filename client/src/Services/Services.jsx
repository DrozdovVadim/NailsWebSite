import style from "./style.module.css"
import generalStyle from "../App.module.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";

const images = import.meta.glob("../images/services/*.{jpg,jpeg,png,gif}", {
  eager: true,
  import: "default",
})




const imgData = Object.keys(images).map((path, index) => ({
  id: "image_"+(index+1),
  src: images[path],
}));


const showImg = (id) => {
  const image = document.querySelector(`#image_${id}`);
  if (image) {
    image.classList.add(style.showImg);
  } else {
    console.warn("Image not found");
  }
};

const closeImg = (id) =>
{
    const image = document.querySelector(`#image_${id}`);
    image.classList.remove(style.showImg);
}

function Services()
{
    const { user } = useUser();
    const userRole= user ? user.Role : false;
    const [formData, setFormData] = useState(null);
    const [serviceData, serServiceData]=useState([]);

    useEffect(()=>
    {
      const getServises= async () =>
      {
            try
            {
              const res= await axios.get("http://localhost:8000/services")
              serServiceData(res.data)
              console.log("Данные с сервера(комп. Услуги)", res.data)
            }
            catch(err)
            {
              console.log(err)
            }
        
      }
      getServises();
    },[])
    const handleClick = (item) => {
        setFormData(item);
    };
    const closeForm = () => setFormData(null);

     return (
    <section id="title3" className={generalStyle.section + " " + style.ServicesSection}>
      <div className={generalStyle.container + " " + style.servicesContainer}>
        <h2 className={generalStyle.sectionTitle}>Мои услуги</h2>
        <div className={style.servicesWrapper}>
          <div className={style.serviceItemsWrapper}>
            {serviceData.map((item) => (
              <div
                key={item.id}
                className={style.serviceItem}
                onClick={() => handleClick(item)}
                onMouseEnter={() => showImg(item.id)}
                onMouseLeave={() => closeImg(item.id)}
                id={item.id}
              >
                <p>{item.name}</p>
                <p>{item.price} рублей</p>
                <p>{item.duration} мин.</p>
              </div>
            ))}
          </div>

          <div className={style.imgWrapper}>
            {imgData.map((item) => (
              <img className={style.img} id={item.id} src={item.src} alt="servicePhoto" key={item.id} />
            ))}
          </div>
        </div>

        {userRole && formData  && (
          <div className={style.chageForm}>
            <h3>Изменение объекта</h3>
            <div className={style.closeForm} onClick={closeForm}>&times;</div>
            <div className={style.formInfo}>
                <p>id- {formData.id}</p>
                <input defaultValue={formData.name}/>
                <input defaultValue={formData.price}/>
                <input defaultValue={formData.duration}/>
            </div>
            <div className={style.btnWrapper}>
                <div>Сохранить</div>
                <div>Удалить</div>
            </div>

          </div>
        )}
      </div>
    </section>
  );
}
export default Services;