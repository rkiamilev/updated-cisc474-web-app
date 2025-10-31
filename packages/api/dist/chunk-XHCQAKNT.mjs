// src/links/entities/link.entity.ts
var Link = class {
  id;
  url;
  title;
  description;
  // Don't really want this, delete this whole file. Just left it in as an example.
  constructor() {
    this.id = 0;
    this.url = "";
    this.title = "";
    this.description = "";
  }
};

export {
  Link
};
