<template>
  <div class="dialog">
    <el-dialog
      :title="dialog.title"
      :visible.sync="dialog.show"
      :close-on-click-modal="false"
      :modal-append-to-body="false"
    >
      <div class="form">
        <el-form ref="form" :model="formData" :rules="form_rules" label-width="120px">
          <el-form-item label="收支类型" prop="type">
            <el-select v-model="formData.type" palceholder="收支类型">
              <el-option
                v-for="(formtype,index) in format_type_list"
                :key="index"
                :label="formtype"
                :value="formtype"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="describe" label="收支描述">
            <el-input v-model="formData.describe"></el-input>
          </el-form-item>
          <el-form-item prop="income" label="收入">
            <el-input v-model="formData.income"></el-input>
          </el-form-item>
          <el-form-item prop="expend" label="支出">
            <el-input v-model="formData.expend"></el-input>
          </el-form-item>
          <el-form-item prop="cash" label="账户现金">
            <el-input v-model="formData.cash"></el-input>
          </el-form-item>
          <el-form-item prop="remark" label="备注">
            <el-input v-model="formData.remark"></el-input>
          </el-form-item>
          <el-form-item class="text_right">
            <el-button @click="dialog.show = false">取消</el-button>
            <el-button type="primary" @click="onSubmit('form')">提交</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: "Dialog",
  data() {
    return {
      format_type_list: [
        "提现",
        "提现手续费",
        "充值",
        "优惠券",
        "充值礼券",
        "转账"
      ],
      form_rules: {
        describe: [
          { required: true, message: "收支描述不能为空", trigger: "blur" }
        ],
        income: [{ required: true, message: "收入不能为空", trigger: "blur" }],
        expend: [{ required: true, message: "支出不能为空", trigger: "blur" }],
        cash: [{ required: true, message: "账户现金不能为空", trigger: "blur" }]
      }
    };
  },
  props: {
    dialog: Object,
    formData: Object
  },
  methods: {
    onSubmit(form) {
      this.$refs[form].validate(valid => {
        const map = {
          add: {
            url: "add",
            action: "add"
          },
          edit: {
            url: `edit/${this.formData.id}`,
            action: "edit"
          }
        };
        // const url =
        //   this.dialog.type === "add" ? "add" : `edit/${this.formData.id}`;
        const url = map[this.dialog.type].url;
        if (valid) {
          this.$axios.post(`/api/profiles/${url}`, this.formData).then(res => {
            // 添加或者编辑成功
            this.$message({
              message: this.dialog.message,
              type: "success"
            });
            // const action = this.dialog.type === ''
            this.$store.dispatch(
              "setCapitalListAction",
              map[this.dialog.type].action
            );
            this.$emit("update");
          });
          // 隐藏dialog
          this.dialog.show = false;
        }
      });
    }
  }
};
</script>
<style scoped>
</style>