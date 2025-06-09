import style from "./style.module.css"
import generalStyle from "../App.module.css";
import { useState } from "react";



const images = import.meta.glob("../images/services/*.{jpg,jpeg,png,gif}", {
  eager: true,
  import: "default",
});



const imgData = Object.keys(images).map((path, index) => ({
  id: "image_"+(index+1),
  src: images[path],
}));


const data=[
    {
        id: 1,
        name: "Услуга 1",
        price: 1300,
        duration: "1.5",
    },
    {
        id: 2,
        name: "Услуга 2",
        price: 1300,
        duration: "1.5",
    },
    {
        id: 3,
        name: "Услуга 3",
        price: 1300,
        duration: "1.5",
    },
    {
        id: 4,
        name: "Услуга 4",
        price: 1300,
        duration: "1.5",
    },
    {
        id: 5,
        name: "Услуга 5",
        price: 1300,
        duration: "1.5",
    },
    {
        id: 6,
        name: "Услуга 6",
        price: 1300,
        duration: "1.5",
    }
]

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


const showform = (id, name, price, duration) =>
{
    return(
        <div className={style.chageForm}>
            <div>&times;</div>
            <p>{id}</p>
            <textarea value={name}></textarea>
            <textarea value={price}></textarea>
            <textarea value={duration}></textarea>
            <div>Сохранить</div>
            <div>Удалить</div>
        </div>
    )
}

function Services()
{
    const [formData, setFormData] = useState(null);

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
            {data.map((item) => (
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
                <p>{item.duration} ч.</p>
              </div>
            ))}
          </div>

          <div className={style.imgWrapper}>
            {imgData.map((item) => (
              <img className={style.img} id={item.id} src={item.src} alt="servicePhoto" key={item.id} />
            ))}
          </div>
        </div>

        {/* 👇 Форма появляется при выборе item */}
        {formData && (
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