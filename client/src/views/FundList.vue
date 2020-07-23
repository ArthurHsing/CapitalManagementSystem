<template>
  <div class="fillContainer">
    <div class="add_btn_container">
      <el-form :inline="true" ref="add_data">
        <el-form-item class="timeFilterLeft">
          <el-date-picker
            v-model="timeRange"
            type="datetimerange"
            align="left"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            :default-time="['00:00:00', '23:59:59']"
          ></el-date-picker>
        </el-form-item>
        <el-form-item class="btnLeft">
          <el-button type="success" size="small" icon="el-icon-search" @click="handleTimeFilter">搜索</el-button>
          <el-button type="info" size="small" icon="el-icon-view" @click="handleShowAll">展示所有</el-button>
        </el-form-item>
        <el-form-item class="btnRight" v-if="managerRight">
          <el-button type="primary" size="small" icon="el-icon-document-add" @click="handleAdd">添加</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table_container">
      <el-table
        v-if="pageData.length > 0"
        :data="pageData"
        max-height="450"
        border
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
        <el-table-column prop="date" label="创建时间" min-width="200" align="center">
          <template slot-scope="scope">
            <i class="el-icon-time"></i>
            <span style="margin-left: 10px">{{ toNormalTime(scope.row.date) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="收支类型" min-width="130" align="center"></el-table-column>
        <el-table-column prop="describe" label="收支描述" min-width="160" align="center"></el-table-column>
        <el-table-column prop="income" label="收入" min-width="150" align="center">
          <template slot-scope="scope">
            <span style="color:#00d053">{{ scope.row.income }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="expend" label="支出" min-width="150" align="center">
          <template slot-scope="scope">
            <span style="color:#f56767">{{ scope.row.expend }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="cash" label="账户现金" min-width="100" align="center">
          <template slot-scope="scope">
            <span style="color:#4db3ff">{{ scope.row.cash }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="200" align="center"></el-table-column>
        <el-table-column
          prop="operation"
          label="操作"
          min-width="200"
          align="center"
          fixed="right"
          v-if="managerRight"
        >
          <template slot-scope="scope">
            <el-button
              type="warning"
              icon="el-icon-edit"
              size="mini"
              @click="handleEdit(scope.$index, scope.row)"
            >编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="handleDelete(scope.$index, scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-row v-if="pageData.length>0">
        <el-col :span="24">
          <div class="pagination">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page.sync="paginations.currentPage"
              :page-sizes="paginations.pageSizes"
              :page-size.sync="paginations.pageSize"
              :layout="paginations.layout"
              :total="paginations.total"
            ></el-pagination>
          </div>
        </el-col>
      </el-row>
      <p v-else-if="loaded" class="empty_tip">没有记录的资金流水信息哟~</p>
    </div>
    <Dialog :dialog="dialog" :formData="formData" @update="getProfile"></Dialog>
  </div>
</template>

<script>
import Dialog from "../components/Dialog";
export default {
  name: "fundList",
  data() {
    return {
      pageData: [],
      tableData: [],
      tableDataAll: [],
      timeRange: null,
      loaded: false,
      dialog: {
        show: false,
      },
      formData: {
        type: "",
        describe: "",
        income: "",
        expend: "",
        cash: "",
        remark: "",
        id: "",
      },
      paginations: {
        currentPage: 1,
        pageSizes: [5, 10, 15],
        pageSize: 5,
        layout: "total, sizes, prev, pager, next, jumper",
        total: 0,
      },
    };
  },
  created() {
    this.getProfile();
  },
  methods: {
    getProfile() {
      this.loaded = false;
      this.$axios
        .get("/api/profiles")
        .then((res) => {
          this.loaded = true; //加载成功
          // 总的数据
          this.tableDataAll = res.data;

          // 过滤后的数据
          const timeFilter = this.$store.getters.timeFilter;
          // 设置tableData
          if (timeFilter.search) {
            this.timeFilter({
              startTime: timeFilter.startTime,
              endTime: timeFilter.endTime,
            });
          } else {
            this.tableData = this.tableDataAll;
          }
          this.setPaginations();
        })
        .catch((err) => {
          throw err;
        });
    },
    setPaginations() {
      this.paginations.total = this.tableData.length;
      switch (this.$store.getters.capitalListAction) {
        //添加状态
        case "add": {
          if (this.paginations.total % this.paginations.pageSize === 1) {
            this.paginations.currentPage += 1;
          }
          break;
        }
        //删除状态
        case "delete": {
          if (
            //在删除一页的唯一数据后，页码应该-1，因为那页的唯一数据已经被删了，那一页已经不存在了
            this.paginations.total % this.paginations.pageSize === 0 && //肯定满足每一页都是满的
            this.paginations.currentPage ===
              parseInt(this.paginations.total / this.paginations.pageSize) + 1
          ) {
            //还要满足先前的页码是当前总页码+1
            this.paginations.currentPage -= 1;
          }
          break;
        }
        // 才进入的初始化的装态或者筛选数据后的状态
        case "obtain": {
          this.paginations.currentPage = 1; //将当前页设置为1
          break;
        }
        //编辑状态，不用判断当前页码，也不用改变当前页码
        case "edit":
        default:
          break;
      }
      this.pageData = this.tableData.filter((el, index) => {
        return (
          index >=
            (this.paginations.currentPage - 1) * this.paginations.pageSize &&
          index < this.paginations.currentPage * this.paginations.pageSize
        );
      });
    },
    handleSizeChange(pageSize) {
      this.paginations.currentPage = 1;
      this.pageData = this.tableData.filter((el, index) => {
        return index < this.paginations.pageSize;
      });
    },
    handleCurrentChange(pageNum) {
      this.pageData = this.tableData.filter((el, index) => {
        return (
          index >= (pageNum - 1) * this.paginations.pageSize &&
          index < pageNum * this.paginations.pageSize
        );
      });
    },
    handleAdd() {
      this.dialog = {
        show: true,
        type: "add",
        title: "添加资金信息",
        message: "数据添加成功！",
      };
      this.formData = {
        type: "",
        describe: "",
        income: "",
        expend: "",
        cash: "",
        remark: "",
        id: "",
      };
    },
    handleEdit(index, row) {
      this.dialog = {
        show: true,
        type: "edit",
        title: "编辑资金信息",
        message: "数据编辑成功！",
      };
      this.formData = {
        type: row.type,
        describe: row.describe,
        income: row.income,
        expend: row.expend,
        cash: row.cash,
        remark: row.remark,
        id: row._id,
      };
    },
    handleDelete(index, row) {
      this.$axios
        .delete(`/api/profiles/delete/${row._id}`)
        .then((res) => {
          this.$message({
            message: "删除成功！",
            type: "info",
          });
          this.$store.dispatch("setCapitalListAction", "delete");
        })
        .catch((err) => {
          throw err;
        });
      this.getProfile();
    },
    handleTimeFilter() {
      if (!this.timeRange) {
        this.$message({
          type: "warning",
          message: "请先选择时间范围！",
        });
      } else {
        this.timeFilter(); //设置tableData
        this.setPaginations(); //设置分页
      }
    },
    timeFilter({
      startTime = this.timeRange[0].getTime(),
      endTime = this.timeRange[1].getTime(),
    } = {}) {
      this.tableData = this.tableDataAll.filter((el, index) => {
        return (
          startTime < new Date(el.date).getTime() &&
          endTime > new Date(el.date).getTime()
        );
      });
      this.$store.dispatch("setTimeFilter", {
        startTime,
        endTime,
        search: true,
      });
      this.$store.dispatch("setCapitalListAction"); //设置action为obtain
    },
    handleShowAll() {
      this.tableData = this.tableDataAll; //设置tableData
      this.setPaginations();
      this.$store.dispatch("setTimeFilter"); //复原timeFilter的状态，即删选状态取消
      this.$store.dispatch("setCapitalListAction"); //设置action为obtain
      // this.timeRange = null;
    },
  },
  computed: {
    toNormalTime() {
      return function (stdTime) {
        var dateObj = new Date(stdTime);
        return `${dateObj.getFullYear()}-${
          dateObj.getMonth() + 1
        }-${dateObj.getDate()} ${dateObj.getHours()}:${dateObj.getMinutes()}:${dateObj.getSeconds()}`;
      };
    },
    managerRight() {
      return this.$store.getters.user.identity === "manager";
    },
  },
  components: {
    Dialog,
  },
};
</script>

<style lang="stylus" scoped>
.pagination {
  margin-top: 10px;
  text-align: right;
}

.fillContainer {
  width: 100%;
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
}

.add_btn_container::after {
  content: '';
  clear: both;
  display: block;
}

.btnRight {
  float: right;
}

.empty_tip {
  text-align: center;
}
</style>