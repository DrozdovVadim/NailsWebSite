import style from "./style.module.css"
import generalStyle from "../App.module.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";

const images = import.meta.glob("../images/services/image_*.{jpg,jpeg,png,gif}", {
  eager: true,
  import: "default",
});

const imgDataMap = {};

Object.keys(images).forEach((path) => {
  const match = path.match(/image_(\d+)\.(jpg|jpeg|png|gif)$/);
  if (match) {
    const id = Number(match[1]);
    imgDataMap[id] = images[path];
  }
});





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
    const [serviceData, setServiceData]=useState([]);
    const [addService, setAddService] = useState(false);



    const getServises= async () =>
      {
            try
            {
              const res= await axios.get("http://localhost:8000/services")
              setServiceData(res.data)
              console.log("Данные с сервера(комп. Услуги)", res.data)
            }
            catch(err)
            {
              console.log(err)
            }
        
      }
    useEffect(()=>
    {
      
      getServises();

    },[])
    const handleClick = (item) => {
        setFormData(item);
        setAddService(false);
    };
    const addServiceFun = () =>
    {
      setAddService(true);
      setFormData(null)
    };
    const closeAddService = () =>
    {
      setAddService(false);
    }
    const closeForm = () => setFormData(null);

    const addServiceFunс = async () =>
{
   const name = document.querySelector("#addName").value;
  const price = document.querySelector("#addPrice").value;
  const dur = document.querySelector("#addDuration").value;
  const photo = document.querySelector("#addPhoto").files[0];
  const formData = new FormData();
  formData.append("name", name);
  formData.append("price", price);
  formData.append("duration", dur);
  formData.append("photo", photo);
  setFormData(null)
try
{
  const res = await axios.post("http://localhost:8000/addService",
  formData
   )
    await getServises();
    setAddService(false);
    setFormData(null);
  
}
catch (e)
  {
     console.log(e)
  }}
const deleteService = async () => {
  try {
    const res = await axios.delete(`http://localhost:8000/deleteService/${formData.id}`);
    console.log("✅ Услуга удалена:", res.data);
    await getServises(); // обновить список после удаления
    setFormData(null);
  } catch (e) {
    console.error("❌ Ошибка при удалении:", e);
  }
};
const saveService = async () => {
  try {
    const minutes = parseInt(formData.duration, 10);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    const padded = (n) => n.toString().padStart(2, '0');
    const intervalStr = `${padded(hours)}:${padded(mins)}:00`;

    const res = await axios.post("http://localhost:8000/saveService", {
      id: formData.id,
      name: formData.name,
      price: formData.price,
      duration: intervalStr, // теперь гарантированно валидный interval
    });
    console.log(intervalStr)
    await getServises();
    setAddService(false);
    setFormData(null);
    console.log(res.data);
  } catch (e) {
    console.log(e);
  }
};

     return (
    <section id="title3" className={generalStyle.section + " " + style.ServicesSection}>
  <div className={generalStyle.container + " " + style.servicesContainer}>
    <h2 className={generalStyle.sectionTitle}>Мои услуги</h2>
    <div className={style.servicesWrapper}>
      {/* Список услуг */}
      <div className={style.serviceItemsWrapper}>
        {userRole && (
          <div onClick={addServiceFun} className={style.addBtn}>Добавить</div>
        )}
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

      {/* Отображение одного изображения по наведению */}
      <div className={style.imgWrapper}>
        {Object.entries(imgDataMap).map(([id, src]) => (
          <img
            key={id}
            id={`image_${id}`}
            src={src}
            alt="service"
            className={style.img}
          />
        ))}
      </div>
    </div>

    {userRole && formData && (
      <div className={style.chageForm}>
        <h3>Изменить услугу</h3>
        <div className={style.closeForm} onClick={closeForm}>&times;</div>
        <div className={style.formInfo}>
          <p>id- {formData.id}</p>
          <input defaultValue={formData.name}  onChange={(e) =>
    setFormData({ ...formData, name: e.target.value })
  }/>
          <input defaultValue={formData.price} onChange={(e) =>
    setFormData({ ...formData, price: e.target.value })
  }/>
          <input defaultValue={formData.duration} onChange={(e) =>
    setFormData({ ...formData, duration: e.target.value })
  }/>
        </div>
        <div className={style.btnWrapper}>
          <div onClick={saveService}>Сохранить</div>
          <div onClick={deleteService}>Удалить</div>
        </div>
      </div>
    )}

    {/* Форма добавления услуги */}
    {userRole && addService && (
      <div className={style.chageForm}>
        <h3>Добавить услугу</h3>
        <div className={style.closeForm} onClick={closeAddService}>&times;</div>
        <div className={`${style.formInfo} ${style.formAddService}`}>
          <input required id="addName" placeholder="Название услуги" />
          <input required id="addPrice" placeholder="Цена" />
          <input required id="addDuration" placeholder="Время (в мин)" />
          <input required id="addPhoto" placeholder="фото" type="file" />
        </div>
        <div className={style.btnWrapper}>
          <div onClick={addServiceFunс}>Добавить</div>
          <div onClick={closeAddService}>Закрыть</div>
        </div>
      </div>
    )}
  </div>
</section>

  );
}
export default Services;