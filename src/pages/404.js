import { navigate } from "gatsby";
import { useEffect } from "react";

const NotFoundPage = () => {
  useEffect(() => {
    navigate("/404.html");
  }, []);

  return null;
};

export default NotFoundPage;
