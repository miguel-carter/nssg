import fs from "fs";
import fm from "front-matter";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt();

const getFiles = (root, type) => {
  return new Promise((resolve, reject) => {
    fs.readdir(root, (error, results) => {
      let files;
      if (error) return reject(error);
      files = results.filter((r) => {
        // TODO: use regex check
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
        const content = fs.readFileSync(root + "/" + file).toString();
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

export {
  getFiles,
  getContentFromFiles,
  parseForFrontMatter,
  rencderMdToHtml,
  getContent,
};
