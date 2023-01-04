import fs from "fs";
import fm from "front-matter";
import path from "path";
import MarkdownIt from "markdown-it";
import pug from "pug";

const md = new MarkdownIt();

const getFiles = (root, type) => {
  return new Promise((resolve, reject) => {
    fs.readdir(root, (error, results) => {
      let files;
      if (error) return reject(error);
      files = results.filter((r) => {
        return r.split(".")[1] === type;
      });
      resolve({ root, files });
    });
  });
};

const getContentFromFiles = ({ root, files }) => {
  return new Promise((resolve, reject) => {
    const ret = [];
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(root, file)).toString();
        ret.push(content);
      } catch (error) {
        reject(error);
      }
    }
    resolve(ret);
  });
};

const parseForFrontMatter = (content) => {
  return content.map((c) => fm(c));
};

const rencderMdToHtml = (parsedContent) => {
  return parsedContent.map((pc) => {
    return { ...pc, body: md.render(pc.body) };
  });
};

const getContent = (path) =>
  new Promise(async (resolve, reject) => {
    try {
      const paths = await getFiles(path, "md");
      const content = await getContentFromFiles(paths);
      const parsedContent = parseForFrontMatter(content);
      const renderContent = rencderMdToHtml(parsedContent);
      resolve(renderContent);
    } catch (error) {
      reject(error);
    }
  });

const initializeContent = async (root, pages) => {
  const ret = [];
  for (const page of pages.entries()) {
    const [d, p] = page;
    const content = await getContent(path.join(root, p, d));
    content.forEach((c) => {
      const { attributes, body } = c;
      ret.push({ dir: d, path: p, attributes, body });
    });
  }
  return ret;
};

const getTemplate = (root, name) => {
  return path.join(root, "src", "templates", `${name}.pug`);
};

const renderContent = (template, content) => {
  const compiledFunction = pug.compileFile(template);
  return compiledFunction(content);
};

const writeContent = (root, name, html) => {
  fs.writeFile(path.join("public", `${name}.html`), html, (err) => {
    if (err) return console.log(err);
  });
};

const renderContents = (root, contents) => {
  for (const page of contents) {
    const { dir, path, attributes, body } = page;

    switch (attributes.template) {
      case "index":
        const template = getTemplate(root, attributes.template);
        const renderedContent = renderContent(template, {
          attributes,
          contents: contents
            .filter((c) => c.attributes.template !== attributes.template)
            .map((c) => {
              return { ...c.attributes };
            }),
        });
        writeContent(root, attributes.template, renderedContent);
        break;
      default:
        console.log("defaulting");
    }
  }
};

export { initializeContent, renderContents };
