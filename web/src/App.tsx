import AppDownload from "./components/AppDownload";
import Categories from "./components/Categories";
import Features from "./components/Features";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import InstallProvider from "./components/InstallProvider";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <InstallProvider>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Categories />
        <HowItWorks />
        <AppDownload />
      </main>
      <Footer />
    </InstallProvider>
  );
}
