"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  links: () => links
});
module.exports = __toCommonJS(index_exports);

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

// src/links/dto/create-link.dto.ts
var CreateLinkDto = class {
};

// src/links/dto/update-link.dto.ts
var import_mapped_types = require("@nestjs/mapped-types");
var UpdateLinkDto = class extends (0, import_mapped_types.PartialType)(CreateLinkDto) {
};

// src/index.ts
var links = {
  dto: {
    CreateLinkDto,
    UpdateLinkDto
  },
  entities: {
    Link
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  links
});
