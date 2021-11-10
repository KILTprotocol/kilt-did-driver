/**
 * Copyright 2018-2021 BOTLabs GmbH.
 *
 * This source code is licensed under the BSD 4-Clause "Original" license
 * found in the LICENSE file in the root directory of this source tree.
 */
import type { IDidDocument, IDidDetails, IDidDocumentExporter } from '@kiltprotocol/types';
/**
 * Export an instance of [[IDidDetails]] to a W3c-compliant DID Document in the format provided.
 *
 * @param details The [[IDidDetails]] instance.
 * @param mimeType The format for the output DID Document. Accepted values are `application/json` and `application/ld+json`.
 * @returns The DID Document formatted according to the mime type provided, or an error if the format specified is not supported.
 */
export declare function exportToDidDocument(details: IDidDetails, mimeType: string): IDidDocument;
export declare const DidDocumentExporter: IDidDocumentExporter;
