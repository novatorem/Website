import { navigate } from "gatsby";
import { useEffect } from "react";

const NotFoundPage = () => {
  useEffect(() => {
    navigate("/404");
  }, []);

  return null;
};

export default NotFoundPage;
