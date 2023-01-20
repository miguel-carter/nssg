import path from "path";
import { initializeContent, renderContents } from "./utils/utils.js";

//

const root = path.resolve();
const pages = new Map();

pages.set("posts", "_content");
pages.set("", "_content");

const contents = await initializeContent(root, pages);

renderContents(root, contents);
