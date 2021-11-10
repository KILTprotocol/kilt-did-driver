"use strict";
/**
 * Copyright 2018-2021 BOTLabs GmbH.
 *
 * This source code is licensed under the BSD 4-Clause "Original" license
 * found in the LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LightDidDetails = exports.FullDidDetails = exports.DidDetails = void 0;
const tslib_1 = require("tslib");
var DidDetails_1 = require("./DidDetails");
Object.defineProperty(exports, "DidDetails", { enumerable: true, get: function () { return DidDetails_1.DidDetails; } });
tslib_1.__exportStar(require("./DidDetails.utils"), exports);
var FullDidDetails_1 = require("./FullDidDetails");
Object.defineProperty(exports, "FullDidDetails", { enumerable: true, get: function () { return FullDidDetails_1.FullDidDetails; } });
tslib_1.__exportStar(require("./FullDidDetails.utils"), exports);
var LightDidDetails_1 = require("./LightDidDetails");
Object.defineProperty(exports, "LightDidDetails", { enumerable: true, get: function () { return LightDidDetails_1.LightDidDetails; } });
