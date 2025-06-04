import Header from './header/header';
import Banner from './banner/Banner';
import generalStyle from "./App.module.css";
import Gallery from './gallery/Gallery';
import FormSection from './formSection/FormSection';
import AboutMe from './aboutMe/aboutMe';
import Contacts from './contacts/Contacts';
import Map from './map/Map';
import Footer from './footer/Footer';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-react-schedule/styles/material.css';

import { UserProvider } from './context/UserContext';

const App = () => {
  return (
    <UserProvider>
      <div>
        <Header />
        <Banner />
        <Gallery />
        <FormSection />
        <AboutMe />
        <Contacts />
        <Map />
        <Footer />
      </div>
    </UserProvider>
  );
};

export default App;