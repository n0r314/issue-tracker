'use strict';
//Mongoose setup for db
const mongoose = require("mongoose");
mongoose.connect(process.env["MONGO_URI"], { useNewUrlParser: true });

const issueSchema = new mongoose.Schema({
  project_name: {
    type: String,
    required: true
  },
  issue_title: {
    type: String, //mongoose.ObjectId,
    required: true
  },
  issue_text: {
    type: String,
    required: true
  },
  created_on: {
    type: Date,
    default: new Date()
  },
  updated_on: {
    type: Date,
    default: new Date()
  },
  created_by: {
    type: String,
    required: true
  },
  assigned_to: {
    type: String,
    default: "" //optional
  },
  open: {
    type: Boolean,
    default: true
  },
  status_text: {
    type: String,
    default: "" //optional
  }
});

let Issue = mongoose.model('Issue', issueSchema, "issues"); //collection "issues" in db


module.exports = function(app) {

  app.route('/api/issues/:project')

    .get(function(req, res) {
      let project = req.params.project;
      let filterObject = { project_name: project };
      const FIELDS = ["issue_title", "issue_text", "created_by", "assigned_to", "status_text", "open", "created_on", "updated_on", "_id"];
      for (let i = 0; i < FIELDS.length; i++) {
        let field = FIELDS[i];
        if (req.query[field]) {
          filterObject[field] = req.query[field]
        };
      }
      Issue.find(filterObject)
        .select({ "project_name": 0, "__v": 0 }) //
        .exec((err, arrayOfIssues) => {
          if (err) return console.log(err);
          console.log("Db searched and " + arrayOfIssues.length + " issues found for project " + project);
          return res.json(arrayOfIssues);
        })
    })

    .post(function(req, res) {
      let project = req.params.project;
      let assigned_to = req.body.assigned_to || "";
      let status_text = req.body.status_text || "";
      //test for required entries : change to filter db error ??
      if (req.body.issue_title && req.body.issue_text && req.body.created_by) {
        var issueToPost = new Issue({
          project_name: project,
          issue_title: req.body.issue_title,
          issue_text: req.body.issue_text,
          created_by: req.body.created_by,
          assigned_to: assigned_to,
          status_text: status_text
        });
      } else {
        console.log("json sent with required field missing error");
        return res.json({
          error: 'required field(s) missing'
        });
      };
      issueToPost.save(function(err, newIssuePosted) {
        if (err) return console.log("Ooops db error : " + err.message);
        console.log("New issue on project " + newIssuePosted.project_name + " saved in db");
        const issueResponse = {
          '_id': newIssuePosted['_id'],
          issue_title: newIssuePosted.issue_title,
          issue_text: newIssuePosted.issue_text,
          created_on: newIssuePosted.created_on,
          updated_on: newIssuePosted.created_on,
          created_by: newIssuePosted.created_by,
          assigned_to: newIssuePosted.assigned_to,
          open: newIssuePosted.open,
          status_text: newIssuePosted.status_text
        };
        return res.json(issueResponse);
      });
    })

    .put(function(req, res) {
      //console.log("method :"  + req.method);
      //console.log("or url :"  + req.originalUrl);
      //console.log(req.body);
      let project = req.params.project;
      if (req.body['_id']) {
        var issueId = req.body['_id']
      } else {
        return res.json({
          error: 'missing _id'
        });
      };
      //update object 
      let updateObject = {};
      const FIELDS = ["issue_title", "issue_text", "created_by", "assigned_to", "status_text", "open", "created_on"];//,"updated_on"];
      for (let i = 0; i < FIELDS.length; i++) {
        let field = FIELDS[i];
        if (req.body[field]) {
          updateObject[field] = req.body[field]
        };
      };
      if (Object.keys(updateObject).length === 0) {
        console.log("I returned no update fields");
        return res.json({
          error: 'no update field(s) sent',
          '_id': issueId
        });
      } else {
        updateObject.updated_on = new Date();
        //console.log(updateObject);
        Issue.findOneAndUpdate({ project_name: project, _id: issueId }, updateObject, function(err, foundIssue) {
          console.log("Db searched ");
          if (err || !foundIssue) {
            console.log("I returned could not update");
            return res.json({
              error: 'could not update',
              '_id': issueId
            });
          }
          console.log("One issue with _id " + foundIssue._id + " in project " + project + " updated");
          return res.json({
            result: 'successfully updated',
            '_id': issueId
          });
        })
      }
    })

    .delete(function(req, res) {
      let project = req.params.project;
      if (req.body['_id']) {
        var issueId = req.body['_id']
      } else {
        return res.json({
          error: 'missing _id'
        });
      }
      Issue.deleteOne({ project_name: project, '_id': issueId }, function(err, obj) {
        if (err || obj.deletedCount == 0) {
          return res.json({
            error: 'could not delete',
            '_id': issueId
          });
        } else if (obj.deletedCount == 1) {
          console.log("One issue deleted in project " + project);
          return res.json({
            result: 'successfully deleted',
            '_id': issueId
          });
        } else { //should never happen
          return res.json({
            error: 'several issues deleted, something went very wrong'
          });
        }
      });
    });

};
