import { useParams } from "react-router-dom";

const HtmlViewer = () => {

  const { fileName } = useParams();

  const src = window.location.port == "5173" ? `http://localhost:3000/Web/${fileName}` : `/Web/${fileName}`;

  return (
    <div className="w-full h-full border-none">
        <iframe src={src} frameborder="0" className="w-full h-screen min-h-[85vh] border-none" title={fileName}></iframe>
    </div>
  );
};

export default HtmlViewer;
