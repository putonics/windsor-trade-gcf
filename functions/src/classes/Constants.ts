import { APPNAME, SUBSCRIBERDOCID } from "./user/Admin"
//MAX_ limit should be taken as such that the number of fields must not exceed 10K per Doc
// because firestore can index only 10K fileds per doc
//Firestore Doc size 1MB (1,048,576 bytes) max; in addition Each Doc can hold 20K field max
export const COLLECTIONS = {
  USER: "users",
  ADMIN: "admins",
  PACKAGES: "packages",
  WITHDRAWALS: "withdrawals",
}

export const isValidDocRequest = (doc: any) => {
  return Boolean(
    doc && doc.appname === APPNAME && doc.subscriberdocid === SUBSCRIBERDOCID
  )
}

/*
N.B.: High-end security implementation through isValidDocRequest()
Step-1: SALT creation: At every login, create a SALT and update into the login-info and send to WebClient.
Step-2: At each valid request check the document with given (appname, subscriberdocid, SALT) exists or not.
Step-3: If isValidDocRequest() then serve the request else response 404
Step-4: --- Encrypt the cypher with SALT before response. Decrypt the response with SALT at WebClient.
*/
