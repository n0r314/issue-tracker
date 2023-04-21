const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  this.timeout(5000);
  var id_test1= "";
  var id_test2= "";
  var id_test3= "";
  
  // POST with every field
  test('POST with every field', function(done) {
    chai
      .request(server)
      .post('/api/issues/test')
      .send({
        project_name: "test",
        issue_title: "test avec tous les champs 1",
        issue_text: "blablabla",
        created_by: "nor",
        assigned_to: "toto",
        status_text: "en cours de résolution"
      })
      .end(function(err, res) {
        assert.equal(res.status, 200, "status should be 200");
        assert.equal(res.type, "application/json", "response should be json");
        assert.property(res.body, 'issue_title', 'issues should have an issue_title field');
        assert.equal(res.body.issue_title, "test avec tous les champs 1");
        assert.property(res.body, 'assigned_to', 'this issue should have an assigned_to field');
        assert.equal(res.body.assigned_to, "toto");
        assert.property(res.body, 'created_on', 'issues should have an created_on field');
        assert.include(res.body.created_on, '2022-');
        assert.property(res.body, '_id', 'issues should have an _id field');
        id_test1 = res.body._id;
        done();
      });
  });


  // POST with every field 2
  test('POST with every field 2', function(done) {
    chai
      .request(server)
      .post('/api/issues/test')
      .send({
        project_name: "test",
        issue_title: "test avec tous les champs 2",
        issue_text: "blablabla",
        created_by: "nor",
        assigned_to: "toto",
        status_text: "getting there"
      })
      .end(function(err, res) {
        assert.equal(res.status, 200, "status should be 200");
        assert.equal(res.type, "application/json", "response should be json");
        assert.property(res.body, 'issue_title', 'issues should have an issue_title field');
        assert.equal(res.body.issue_title, "test avec tous les champs 2");
        assert.property(res.body, 'assigned_to', 'this issue should have an assigned_to field');
        assert.equal(res.body.assigned_to, "toto");
        assert.property(res.body, 'created_on', 'issues should have an created_on field');
        assert.include(res.body.created_on, '2022-');
        assert.property(res.body, '_id', 'issues should have an _id field');
        id_test2 = res.body._id;
        done();
      });
  });
  
  // POST with only required fields
  test('POST with required fields only', function(done) {
    chai
      .request(server)
      .post('/api/issues/test')
      .send({
        project_name: "test",
        issue_title: "test champs obligatoires",
        issue_text: "blablabla ahah",
        created_by: "nor"
      })
      .end(function(err, res) {
        assert.equal(res.status, 200, "status should be 200");
        assert.equal(res.type, "application/json", "response should be json");
        assert.property(res.body, 'issue_title', 'issues should have an issue_title field');
        assert.equal(res.body.issue_title, "test champs obligatoires");
        assert.property(res.body, 'assigned_to', 'this issue should have an assigned_to field created automatically');
        assert.equal(res.body.assigned_to, "");
        assert.property(res.body, 'created_on', 'issues should have an created_on field');
        assert.include(res.body.created_on, '2022-');
        assert.property(res.body, '_id', 'issues should have an _id field');
        id_test3 = res.body._id;
        done();
      });
  });

  // POST with only required field missing
  test('POST with required field missing', function(done) {
    chai
      .request(server)
      .post('/api/issues/test')
      .send({
        project_name: "test",
        issue_title: "test sans auteur",
        issue_text: "blablabla ahah"
      })
      .end(function(err, res) {
        assert.equal(res.status, 200, "status should be 200");
        assert.equal(res.type, "application/json", "response should be json");
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
  });

  // GET issues without filter
  test('GET issues without filter', function(done) {
    chai
      .request(server)
      .get('/api/issues/test')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json", "response should be json");
        assert.typeOf(res.body, 'array');
        assert.property(res.body[0], 'issue_title', 'Issues have a title');
        assert.property(res.body[0], 'created_by', 'Issues have an author in created_by');
        done();
      });
  });

  // GET issues with one filter
  test('GET issues with one filter', function(done) {
    chai
      .request(server)
      .get('/api/issues/test?issue_text=blablabla')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json", "response should be json");
        assert.typeOf(res.body, 'array');
        assert.property(res.body[0], 'issue_text', 'This issue should have a text');
        assert.equal(res.body[0].issue_text, 'blablabla');
        done();
      });
  });
  
  // GET issues with multiple filters
test('GET issues with multiple filter', function(done) {
    chai
      .request(server)
      .get('/api/issues/test?issue_text=blablabla&status_text=getting%20there')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json", "response should be json");
        assert.typeOf(res.body, 'array');
        assert.property(res.body[0], 'issue_text', 'This issue should have a text');
        assert.equal(res.body[0].issue_text, 'blablabla');
        assert.property(res.body[0], 'status_text', 'This issue should have a status text');
        assert.equal(res.body[0].status_text, 'getting there');
        done();
      });
  });

  
  // PUT to update one field 
  test('PUT to update one field', function(done) {
    chai
      .request(server)
      .put('/api/issues/test')
      .send({
        '_id': id_test3,
        issue_title: "updated title"
      })
      .end(function(err, res) {
        assert.equal(res.status, 200, "status should be 200");
        assert.equal(res.type, "application/json", "response should be json");
        assert.property(res.body, 'result', 'response should have a result field');
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body['_id'], id_test3);
        done();
      });
  });

  // PUT to update multiple fields
  test('PUT to update multiple fields', function(done) {
    chai
      .request(server)
      .put('/api/issues/test')
      .send({
        '_id': id_test3,
        issue_title: "updated title a second time",
        status_text: "getting there",
        open: "false"
      })
      .end(function(err, res) {
        assert.equal(res.status, 200, "status should be 200");
        assert.equal(res.type, "application/json", "response should be json");
        assert.property(res.body, 'result', 'response should have a result field');
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body['_id'], id_test3);
        done();
      });
  });

  // PUT with missing _id
  test('PUT with missing _id',
    function(done) {
      chai
        .request(server)
        .put('/api/issues/test')
        .send({
          issue_title: "should not appear",
          status_text: "getting there",
          open: "false"
        })
        .end(function(err, res) {
          assert.equal(res.status, 200, "status should be 200");
          assert.equal(res.type, "application/json", "response should be json");
          assert.property(res.body, 'error', 'response should have an error field');
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });

  // PUT with no update fields
  test('PUT with no update fields',
    function(done) {
      chai
        .request(server)
        .put('/api/issues/test')
        .send({
          '_id': id_test1
        })
        .end(function(err, res) {
          assert.equal(res.status, 200, "status should be 200");
          assert.equal(res.type, "application/json", "response should be json");
          assert.property(res.body, 'error', 'response should have an error field');
          assert.equal(res.body.error, 'no update field(s) sent');
          assert.equal(res.body['_id'], id_test1);
          done();
        });
    });

  // PUT with invalid _id
  test('PUT with invalid _id', function(done) {
    chai
      .request(server)
      .put('/api/issues/test')
      .send({
        '_id': id_test1 + "a",
        issue_title: "updated title"
      })
      .end(function(err, res) {
        assert.equal(res.status, 200, "status should be 200");
        assert.equal(res.type, "application/json", "response should be json");
        assert.property(res.body, 'error', 'response should have an error field');
        assert.equal(res.body.error, 'could not update');
        assert.property(res.body, '_id', 'response should have an _id field');
        assert.equal(res.body['_id'], id_test1 + "a");
        done();
      });
  });

  // DELETE issue
  test('DELETE issue',
    function(done) {
      chai
        .request(server)
        .delete('/api/issues/test')
        .send({
          '_id': id_test2
        })
        .end(function(err, res) {
          assert.equal(res.status, 200, "status should be 200");
          assert.equal(res.type, "application/json", "response should be json");
          assert.property(res.body, 'result', 'response should have a result field');
          assert.equal(res.body.result, 'successfully deleted');
          assert.property(res.body, '_id', 'response should have an _id field');
          assert.equal(res.body['_id'], id_test2);
          done();
        });
    });

 // DELETE issue with invalid _id
  test('DELETE issue with invalid _id',
    function(done) {
      chai
        .request(server)
        .delete('/api/issues/test')
        .send({
          '_id': "5871dda29faedc3491ff93bb"
        })
        .end(function(err, res) {
          assert.equal(res.status, 200, "status should be 200");
          assert.equal(res.type, "application/json", "response should be json");
          assert.property(res.body, 'error', 'response should have an error field');
          assert.equal(res.body.error, 'could not delete');
          assert.property(res.body, '_id', 'response should have an _id field');
          assert.equal(res.body['_id'], "5871dda29faedc3491ff93bb");
          done();
        });
    });
  
  // DELETE issue with missing _id
  test('DELETE issue with missing _id',
    function(done) {
      chai
        .request(server)
        .delete('/api/issues/test')
        .send({
        })
        .end(function(err, res) {
          assert.equal(res.status, 200, "status should be 200");
          assert.equal(res.type, "application/json", "response should be json");
          assert.property(res.body, 'error', 'response should have an error field');
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });
});
