import Header from './header/header';
import Banner from './banner/Banner';
import generalStyle from "./App.module.css";
import Gallery from './gallery/Gallery';
import FormSection from './formSection/FormSection';
import AboutMe from './aboutMe/aboutMe';
import Contacts from './contacts/Contacts';


const App = () => {
  return (
    <div >
        <Header/>
        <Banner/>
        <Gallery/>
        <FormSection/>
        <AboutMe/>
        <Contacts/>
    </div>
  );
};
export default App;
