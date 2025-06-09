import React, { useEffect, useState } from "react";
import axios from "axios";
import { Calendar, Views, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";
import style from "./formSection.module.css";
import generalStyle from "../App.module.css";
import ru from "date-fns/locale/ru";
import { useUser } from "../context/UserContext";

// Локализация для date-fns
const locales = {
  ru,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function FormSection() {
  const { user, logout } = useUser();
  const [events, setEvents] = useState([]);
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState(Views.WEEK);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [bookingIdMap, setBookingIdMap] = useState({});

  useEffect(() => {
    // Загрузка расписания
    const fetchSchedule = async () => {
      try {
        const res = await axios.get("http://localhost:8000/schedule");
        console.log("Данные с сервера (расписание):", res.data);
        const mapped = res.data.map((slot) => ({
          id: slot.id,
          title: slot.is_available ? "Свободно" : "Занято",
          start: new Date(`${slot.date}T${slot.start_time}`),
          end: new Date(`${slot.date}T${slot.end_time}`),
          allDay: false,
          isAvailable: slot.is_available,
        }));
        setEvents(mapped);
      } catch (err) {
        console.error("Ошибка загрузки расписания:", err);
      }
    };

    // Загрузка услуг
    const fetchServices = async () => {
      try {
        const res = await axios.get("http://localhost:8000/services");
        console.log("Данные с сервера (услуги):", res.data);
        setServices(res.data);
        if (res.data.length > 0) {
          setSelectedService(res.data[0].id);
        }
      } catch (err) {
        console.error("Ошибка загрузки услуг:", err);
      }
    };

    // Загрузка бронирований пользователя
    const fetchUserBookings = async () => {
      if (user) {
        console.log("user.id:", user.id);
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            console.error("Токен отсутствует");
            return;
          }
          const res = await axios.get(`http://localhost:8000/user-bookings?userId=${user.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log("Бронирования пользователя:", res.data);

          // Если сервер возвращает массив чисел (schedule_id)
          if (Array.isArray(res.data) && typeof res.data[0] === "number") {
            setUserBookings(res.data);
            setBookingIdMap({}); // Нельзя создать mapping без booking_id
            console.warn("Сервер возвращает только schedule_id. bookingIdMap не будет создан.");
          } 
          // Если сервер возвращает массив объектов {id, schedule_id}
          else if (Array.isArray(res.data) && res.data[0]?.schedule_id) {
            const bookings = res.data;
            const newBookingIdMap = {};
            bookings.forEach((booking) => {
              newBookingIdMap[booking.schedule_id] = booking.id;
            });
            setUserBookings(bookings.map((booking) => booking.schedule_id));
            setBookingIdMap(newBookingIdMap);
          } else {
            console.error("Неверный формат данных от сервера:", res.data);
            setUserBookings([]);
            setBookingIdMap({});
          }
        } catch (err) {
          console.error("Ошибка загрузки бронирований:", err);
          if (err.response?.status === 401) {
            alert("Ошибка авторизации. Пожалуйста, войдите снова.");
            logout();
          } else if (err.response?.status === 404) {
            console.log("Эндпоинт /user-bookings не найден или userId некорректен");
            setUserBookings([]);
            setBookingIdMap({});
          } else {
            console.error("Другая ошибка:", err);
          }
        }
      }
    };

    fetchSchedule();
    fetchServices();
    fetchUserBookings();
  }, [user, logout]);

  const cancelBooking = async (scheduleId) => {
    if (!user) {
      alert("Пожалуйста, войдите в систему, чтобы отменить запись.");
      return;
    }

    const bookingId = bookingIdMap[scheduleId];
    if (!bookingId) {
      alert("Идентификатор бронирования не найден.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Токен авторизации отсутствует. Пожалуйста, войдите в систему снова.");
        return;
      }

      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("bookingId", bookingId);

      await axios.delete("http://localhost:8000/delete-booking", {
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Обновляем локальное состояние событий
      setEvents((prevEvents) =>
        prevEvents.map((e) =>
          e.id === scheduleId
            ? { ...e, title: "Свободно", isAvailable: true }
            : e
        )
      );

      // Обновляем бронирования пользователя
      setUserBookings((prev) => prev.filter((id) => id !== scheduleId));

      // Удаляем bookingId из bookingIdMap
      setBookingIdMap((prev) => {
        const newMap = { ...prev };
        delete newMap[scheduleId];
        return newMap;
      });

      alert("Бронирование успешно отменено!");
    } catch (err) {
      console.error("Ошибка при отмене бронирования:", err);
      if (err.response?.status === 401) {
        alert("Ошибка авторизации. Пожалуйста, войдите в систему снова.");
        logout();
      } else if (err.response?.status === 403) {
        alert("Вы не можете отменить чужое бронирование.");
      } else if (err.response?.status === 404) {
        alert("Бронирование не найдено.");
      } else {
        alert("Не удалось отменить бронирование. Попробуйте снова.");
      }
    }
  };

  // Обновление заголовков событий при изменении userBookings
  useEffect(() => {
    setEvents((prevEvents) =>
      prevEvents.map((event) => {
        const now = new Date();
        const isPast = event.start < now;
        const isUserBooking = userBookings.includes(event.id);

        let title = event.title;
        if (isUserBooking) {
          title = "Моя запись";
        } else if (isPast) {
          title = "Неактуально";
        } else if (!event.isAvailable) {
          title = "Занято";
        } else {
          title = "Свободно";
        }

        return { ...event, title };
      })
    );
  }, [userBookings]);

  // Функция для изменения стилей событий
  const eventStyleGetter = (event) => {
    const now = new Date();
    const isPast = event.start < now;
    const isUserBooking = userBookings.includes(event.id);

    let backgroundColor;
    if (isUserBooking) {
      backgroundColor = "#ff69b4"; // Розовый для забронированных пользователем
    } else if (isPast) {
      backgroundColor = "#6c757d"; // Серый для прошедших
    } else if (!event.isAvailable) {
      backgroundColor = "#dc3545"; // Красный для занятых
    } else {
      backgroundColor = "#28a745"; // Зеленый для свободных
    }

    return {
      style: {
        backgroundColor,
        color: "white",
        borderRadius: "4px",
        border: "none",
        display: "block",
        // Allow pointer events for user bookings, even if past
        pointerEvents: isUserBooking ? "auto" : isPast ? "none" : "auto",
      },
    };
  };

  // Функция для открытия формы при двойном клике
  const handleDoubleClick = (event) => {
    if (!event.isAvailable) {
      if (userBookings.includes(event.id)) {
        // Allow canceling user's own booking
        const confirmCancel = window.confirm("Хотите отменить эту запись?");
        if (confirmCancel) {
          cancelBooking(event.id);
        }
      } else {
        alert("Этот слот уже занят и не доступен для записи.");
      }
      return;
    }
    setSelectedSlot(event);
    setShowForm(true);
  };

  // Функция для записи на слот
  const bookSlot = async () => {
    if (!user) {
      alert("Пожалуйста, войдите в систему, чтобы записаться.");
      return;
    }

    if (!selectedService) {
      alert("Пожалуйста, выберите услугу.");
      return;
    }

    if (!selectedSlot) {
      alert("Выберите слот для записи.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Токен авторизации отсутствует. Пожалуйста, войдите в систему снова.");
        return;
      }

      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("scheduleId", selectedSlot.id);
      formData.append("serviceId", selectedService);

      const response = await axios.post("http://localhost:8000/book-slot", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Обновляем локальное состояние событий
      setEvents((prevEvents) =>
        prevEvents.map((e) =>
          e.id === selectedSlot.id
            ? { ...e, title: "Моя запись", isAvailable: false }
            : e
        )
      );

      // Обновляем бронирования пользователя
      setUserBookings((prev) => [...prev, selectedSlot.id]);

      // Обновляем bookingIdMap с новым booking_id из ответа сервера
      setBookingIdMap((prev) => ({
        ...prev,
        [selectedSlot.id]: response.data.booking_id,
      }));

      setShowForm(false);
      alert("Вы успешно записались!");
      console.log("Ответ сервера:", response.data);
    } catch (err) {
      console.error("Ошибка при записи на слот:", err);
      if (err.response?.status === 401) {
        alert("Ошибка авторизации. Пожалуйста, войдите в систему снова.");
        logout();
      } else if (err.response?.status === 403) {
        alert("Вы не можете бронировать слот от имени другого пользователя.");
      } else if (err.response?.status === 400) {
        alert("Этот слот уже занят или недоступен.");
      } else {
        alert("Не удалось записаться. Попробуйте снова.");
      }
    }
  };

  // Кастомный компонент для рендеринга событий
  const EventComponent = ({ event }) => {
    const isUserBooking = userBookings.includes(event.id);
    return (
      <div>
        <span>{event.title}</span>
        {isUserBooking && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Предотвращаем срабатывание других событий
              cancelBooking(event.id);
            }}
            style={{
              marginLeft: "5px",
              fontSize: "12px",
              padding: "2px 5px",
              backgroundColor: "red",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              pointerEvents: "auto", // Ensure button is clickable
            }}
          >
            Удалить
          </button>
        )}
      </div>
    );
  };

  return (
    <div id="scheduleSection" className={generalStyle.section + " " + style.formSection}>
      <div className={generalStyle.container + " " + style.formContainer}>
        <h2 className={generalStyle.sectionTitle}>Сходи на маникюр</h2>
        {showForm && selectedSlot && (
          <div className={style.bookingForm}>
            <h3>Форма записи</h3>
            <p>
              <strong>Дата записи:</strong>{" "}
              {format(selectedSlot.start, "dd.MM.yyyy")}
            </p>
            <p>
              <strong>Время записи:</strong>{" "}
              {format(selectedSlot.start, "HH:mm")} -{" "}
              {format(selectedSlot.end, "HH:mm")}
            </p>
            <div>
              <label>Выберите услугу: </label>
              <select
                value={selectedService || ""}
                onChange={(e) => setSelectedService(parseInt(e.target.value))}
                disabled={services.length === 0}
              >
                {services.length === 0 ? (
                  <option value="">Услуги не найдены</option>
                ) : (
                  services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} ({service.price} руб., {service.duration}{" "}
                      мин)
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              {user && (
                <button onClick={bookSlot} disabled={!selectedService}>
                  Записаться
                </button>
              )}
              <button onClick={() => setShowForm(false)}>Отмена</button>
            </div>
          </div>
        )}
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 400 }}
          date={date}
          onNavigate={(newDate) => setDate(newDate)}
          view={view}
          onView={(newView) => setView(newView)}
          views={[Views.DAY, Views.WEEK, Views.MONTH]}
          min={new Date(2025, 0, 1, 10, 0)}
          max={new Date(2025, 0, 1, 21, 0)}
          messages={{
            next: "Следующий",
            previous: "Предыдущий",
            today: "Сегодня",
            month: "Месяц",
            week: "Неделя",
            day: "День",
            agenda: "Повестка",
            date: "Дата",
            time: "Время",
            event: "Событие",
            allDay: "Весь день",
          }}
          tooltipAccessor={null}
          onDoubleClickEvent={handleDoubleClick}
          eventPropGetter={eventStyleGetter}
          components={{
            event: EventComponent,
          }}
        />
      </div>
    </div>
  );
}

export default FormSection;