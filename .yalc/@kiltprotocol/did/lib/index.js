"use strict";
/**
 * Copyright 2018-2021 BOTLabs GmbH.
 *
 * This source code is licensed under the BSD 4-Clause "Original" license
 * found in the LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DidUtils = exports.DidChain = void 0;
const tslib_1 = require("tslib");
exports.DidChain = tslib_1.__importStar(require("./Did.chain"));
exports.DidUtils = tslib_1.__importStar(require("./Did.utils"));
tslib_1.__exportStar(require("./DemoKeystore/DemoKeystore"), exports);
tslib_1.__exportStar(require("./DidDetails"), exports);
tslib_1.__exportStar(require("./DidResolver/DefaultResolver"), exports);
tslib_1.__exportStar(require("./DidDocumentExporter"), exports);
