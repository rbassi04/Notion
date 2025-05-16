import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import { Default } from './../components/content/Default';
import { Content } from "../components/content/Content";
import { ShareContent } from './../components/content/ShareContent';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Default /> },
      { path: "share/:doc_id", element: <ShareContent /> },
      { path: "document/:doc_id", element: <Content /> },
    ],
  },
]);


export default router;

